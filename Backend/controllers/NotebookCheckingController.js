const mongoose = require("mongoose");
const { createNotification } = require("../config/notify");
const ClassDetails = require("../models/ClassDetails");
const Form3 = require("../models/Form3");
const notification = require("../models/notification");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const { formInitiatedEmail, formCompletedEmail, reflectionSubmittedEmail, reminderEmail } = require("../utils/emailTemplates");
const { recordAuditLog, calculateDiff } = require("../utils/auditLogger");

// Helper to strip non-hex characters (e.g. trailing period from copied links: "6a9e...bef.")
const cleanId = (id) => (id ? id.toString().trim().replace(/[^a-f\d]/gi, "") : "");

// ── Shared Helper for Server-Side Filtering, Pagination (limit/skip) & Count ───
const buildNotebookQueryAndPaginate = async (req, baseCondition = {}) => {
  const queryFilter = { ...baseCondition };

  // 1. Session date filter
  if (req.sessionDateFilter) {
    queryFilter.createdAt = req.sessionDateFilter;
  }

  // 2. Class filter
  if (req.query.className) {
    const classNames = req.query.className
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (classNames.length > 0) {
      const matchingClasses = await ClassDetails.find(
        { className: { $in: classNames } },
        "_id"
      ).lean();
      const matchingIds = matchingClasses.map((c) => c._id.toString());
      queryFilter["grenralDetails.className"] = {
        $in: [...classNames, ...matchingIds],
      };
    }
  }

  // 4. Section filter
  if (req.query.section) {
    const sections = req.query.section
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sections.length > 0) {
      queryFilter["grenralDetails.Section"] = { $in: sections };
    }
  }

  // 5. Subject filter
  if (req.query.subject) {
    const subjects = req.query.subject
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (subjects.length > 0) {
      queryFilter["grenralDetails.Subject"] = { $in: subjects };
    }
  }

  // 6. Date of Observation
  if (req.query.date || req.query.observationDate) {
    const d = new Date(req.query.date || req.query.observationDate);
    if (!isNaN(d.getTime())) {
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      queryFilter["grenralDetails.DateOfObservation"] = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
  }

  // 7. Boolean completion / reflection filters
  if (
    req.query.isTeacherComplete !== undefined &&
    req.query.isTeacherComplete !== null &&
    req.query.isTeacherComplete !== ""
  ) {
    queryFilter.isTeacherComplete =
      String(req.query.isTeacherComplete) === "true";
  }
  if (
    req.query.isObserverComplete !== undefined &&
    req.query.isObserverComplete !== null &&
    req.query.isObserverComplete !== ""
  ) {
    queryFilter.isObserverComplete =
      String(req.query.isObserverComplete) === "true";
  }
  if (
    req.query.isReflation !== undefined &&
    req.query.isReflation !== null &&
    req.query.isReflation !== ""
  ) {
    queryFilter.isReflation = String(req.query.isReflation) === "true";
  }

  // 8. Person & Name search
  const andConditions = [];

  if (req.query.teacherName) {
    const terms = req.query.teacherName
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (terms.length > 0) {
      const userConditions = terms.map((term) => ({
        name: { $regex: term, $options: "i" },
      }));
      const matchedUsers = await User.find({ $or: userConditions }, "_id").lean();
      const matchedIds = matchedUsers.map((u) => u._id);
      andConditions.push({ teacherID: { $in: matchedIds } });
    }
  }

  if (req.query.observerName) {
    const terms = req.query.observerName
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (terms.length > 0) {
      const userConditions = terms.map((term) => ({
        name: { $regex: term, $options: "i" },
      }));
      const matchedUsers = await User.find({ $or: userConditions }, "_id").lean();
      const matchedIds = matchedUsers.map((u) => u._id);
      andConditions.push({
        $or: [
          { createdBy: { $in: matchedIds } },
          { "grenralDetails.NameofObserver": { $in: matchedIds } },
        ],
      });
    }
  }

  const search = req.query.search || req.query.searchName || req.query.personName;
  if (search) {
    const searchTerms = search
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (searchTerms.length > 0) {
      const userConditions = searchTerms.map((term) => ({
        name: { $regex: term, $options: "i" },
      }));
      const matchedUsers = await User.find(
        { $or: userConditions },
        "_id"
      ).lean();
      const matchedIds = matchedUsers.map((u) => u._id);

      andConditions.push({
        $or: [
          { teacherID: { $in: matchedIds } },
          { createdBy: { $in: matchedIds } },
          { "grenralDetails.NameofObserver": { $in: matchedIds } },
        ],
      });
    }
  }

  if (andConditions.length > 0) {
    if (queryFilter.$and) {
      queryFilter.$and.push(...andConditions);
    } else if (queryFilter.$or) {
      queryFilter.$and = [{ $or: queryFilter.$or }, ...andConditions];
      delete queryFilter.$or;
    } else {
      queryFilter.$and = andConditions;
    }
  }

  // 8. Pagination params (limit & skip)
  const hasPagination =
    req.query.page !== undefined ||
    req.query.limit !== undefined ||
    req.query.skip !== undefined;

  const isAll =
    !hasPagination ||
    req.query.limit === "all" ||
    req.query.all === "true" ||
    parseInt(req.query.limit, 10) >= 99999;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = isAll ? 0 : Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = isAll
    ? 0
    : req.query.skip !== undefined
    ? Math.max(0, parseInt(req.query.skip, 10))
    : (page - 1) * limit;

  // Count total matching documents on server
  const totalCount = await Form3.countDocuments(queryFilter);
  console.log("[DEBUG Form3 Pagination] queryFilter:", JSON.stringify(queryFilter), "totalCount:", totalCount);

  // Parse sorting params
  const { parseSortParams } = require("../utils/sortHelper");
  const form3SortMap = {
    observationDate: "grenralDetails.DateOfObservation",
    date: "grenralDetails.DateOfObservation",
    className: "grenralDetails.className",
    section: "grenralDetails.Section",
    subject: "grenralDetails.Subject",
    personName: "teacherID",
    teacherName: "teacherID",
    observerName: "createdBy",
    totalScores: "totalScores",
    isTeacherComplete: "isTeacherComplete",
    isObserverComplete: "isObserverComplete",
    isReflation: "isReflation",
    createdAt: "createdAt",
  };
  const sortCriteria = parseSortParams(req.query, form3SortMap, { createdAt: -1 });

  // Query database with server-side skip & limit
  let dbQuery = Form3.find(queryFilter)
    .sort(sortCriteria)
    .populate({
      path: "teacherID",
      select: "-password -mobile -employeeId -customId",
    })
    .populate({
      path: "grenralDetails.NameofObserver",
      select: "-password -mobile -employeeId -customId",
    })
    .populate({
      path: "createdBy",
      select: "-password -mobile -employeeId -customId",
    });

  if (!isAll && limit > 0) {
    dbQuery = dbQuery.skip(skip).limit(limit);
  }

  const forms = await dbQuery.lean();

  // 10. Resolve Class Names from ClassDetails
  try {
    const classDetailsList = await ClassDetails.find({}).lean();
    const classMap = {};
    classDetailsList.forEach((c) => {
      if (c?._id) classMap[c._id.toString()] = c.className;
    });

    forms.forEach((form) => {
      const cur = form?.grenralDetails?.className;
      if (cur && classMap[cur.toString()]) {
        form.grenralDetails.className = classMap[cur.toString()];
      }
    });
  } catch (e) {
    console.error("Error resolving class names in Form 3:", e);
  }

  // 11. Fetch system-wide filter options for header filter dropdowns
  let filterOptions = { classes: [], sections: [] };
  try {
    const allClasses = await ClassDetails.find({}, "className").lean();
    const distinctSections = await Form3.distinct("grenralDetails.Section", {
      "grenralDetails.Section": { $ne: null },
    });
    filterOptions = {
      classes: allClasses.map((c) => c.className).filter(Boolean),
      sections: distinctSections.filter(Boolean),
    };
  } catch (e) {
    // ignore
  }

  return {
    data: forms,
    pagination: {
      total: totalCount,
      page: isAll ? 1 : page,
      limit: isAll ? totalCount : limit,
      skip: isAll ? 0 : skip,
      totalPages: isAll ? 1 : Math.ceil(totalCount / (limit || 1)),
    },
    filterOptions,
  };
};

exports.createForm = async (req, res) => {
  const {
    NameofObserver,
    DateOfObservation,
    className,
    Section,
    Subject,
    ClassStrength,
    NotebooksSubmitted,
    Absentees,
    Defaulters,
    maintenanceOfNotebooks,
    qualityOfOppurtunities,
    qualityOfTeacherFeedback,
    qualityOfLearner,
    isDraft,
    currentStep,
  } = req.body;

  const userId = req?.user?.id;
  try {
    const user = await User.findById(
      userId,
      "-password -mobile -employeeId -customId"
    );

    // Check if the user has access as "Teacher" or "SuperAdmin" or dual role
    const isTeacherOrAdmin = user && (user.access === "Teacher" || user.isDualRole || user.access === "SuperAdmin" || user.access === "Superadmin");
    if (!isTeacherOrAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have permission to create this form." });
    }

    const isDraftSave = isDraft === true;

    // Ensure that NameofObserver is provided for final submissions
    if (!NameofObserver && !isDraftSave) {
      return res.status(400).json({ message: "Name of Observer is required." });
    }

    // Prevent selecting oneself as observer
    if (NameofObserver && NameofObserver.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot select yourself as the observer." });
    }

    let finalClassName = className;
    if (className && mongoose.Types.ObjectId.isValid(className) && /^[a-f\d]{24}$/i.test(className)) {
      const classData = await ClassDetails.findById(className);
      if (classData) {
        finalClassName = classData.className;
      }
    } else if (className) {
      const classData = await ClassDetails.findOne({ className });
      if (classData) {
        finalClassName = classData.className;
      }
    }

    if (!finalClassName && !isDraftSave) {
      return res
        .status(400)
        .json({ success: false, message: "Class and Section is Required!" });
    }

    const newForm = new Form3({
      grenralDetails: {
        NameofObserver: NameofObserver || null,
        DateOfObservation: DateOfObservation || null,
        className: finalClassName || null,
        Section: Section || null,
        Subject: Subject || null,
      },
      NotebooksTeacher: {
        ClassStrength: ClassStrength || null,
        NotebooksSubmitted: NotebooksSubmitted || null,
        Absentees: Absentees || null,
        Defaulters: Defaulters || null,
      },
      createdBy: user?._id,
      teacherID: user?._id,
      isObserverComplete: false,
      ObserverForm: {},
      isTeacherComplete: isDraftSave ? false : true,
      isDraft: isDraftSave,
      currentStep: currentStep !== undefined ? currentStep : (isDraftSave ? 1 : 0),
      TeacherForm: {
        maintenanceOfNotebooks: maintenanceOfNotebooks || [],
        qualityOfOppurtunities: qualityOfOppurtunities || [],
        qualityOfTeacherFeedback: qualityOfTeacherFeedback || [],
        qualityOfLearner: qualityOfLearner || [],
      },
    });

    const savedForm = await newForm.save();

    recordAuditLog({
      req,
      action: 'CREATE',
      module: 'Notebook Checking',
      targetId: savedForm._id,
      details: `${isDraftSave ? 'Saved draft' : 'Created form'} for Class ${finalClassName || ''} Section ${Section || ''} (Subject: ${Subject || ''})`,
    });

    if (!isDraftSave && NameofObserver) {
      try {
        await createNotification({
          title: "You are invited to fill the Notebook Checking",
          route: `notebook-checking-proforma/create/${savedForm._id}`,
          reciverId: NameofObserver,
        });
      } catch (notifErr) {
        console.error("Error creating notification in createForm:", notifErr);
      }

      try {
        const recipientEmail = await User.findById(NameofObserver);
        const route = `notebook-checking-proforma/create/${savedForm._id}`;
        const emailData = formInitiatedEmail({
          recipientName: recipientEmail?.name,
          initiatorName: user.name,
          formTitle: "Notebook Checking Proforma",
          formRoute: route,
          className: finalClassName,
          section: Section,
          subject: Subject,
          date: DateOfObservation,
        });
        if (recipientEmail?.email) {
          await sendEmail(recipientEmail.email, emailData.subject, emailData.html);
        }
      } catch (emailErr) {
        console.error("Error sending email in createForm:", emailErr);
      }
    }

    // Send success response
    res.status(201).json({
      message: isDraftSave ? "Draft saved successfully" : "Form created successfully",
      form: savedForm,
      status: true,
      success: true,
    });
  } catch (Error) {
    console.error("Error creating notebook form:", Error);
    res.status(500).json({ message: "Error creating notebook form", error: Error.message });
  }
};
exports.createInitiate = async (req, res) => {
  const { isTeacher, teacherIDs, teacherID, className, Section, Subject } = req.body;
  const userId = req?.user?.id;

  try {
    let finalClassName = className;
    if (className && mongoose.Types.ObjectId.isValid(className) && /^[a-f\d]{24}$/i.test(className)) {
      const classData = await ClassDetails.findById(className);
      if (classData) finalClassName = classData.className;
    } else if (className) {
      const classData = await ClassDetails.findOne({ className });
      if (classData) finalClassName = classData.className;
    }

    // Extract single teacher ID (each form is strictly individual to ONE teacher)
    let rawId = teacherID || (Array.isArray(teacherIDs) ? teacherIDs[0] : teacherIDs);
    if (rawId && typeof rawId === "object") {
      rawId = rawId._id || rawId.value || rawId.id || null;
    }
    const cleanTeacherId = rawId ? String(rawId).trim() : "";

    if (!cleanTeacherId || !mongoose.Types.ObjectId.isValid(cleanTeacherId) || !/^[a-f\d]{24}$/i.test(cleanTeacherId)) {
      return res.status(400).json({ error: "Please select a valid teacher." });
    }

    if (userId && cleanTeacherId === userId.toString()) {
      return res.status(400).json({ error: "You cannot initiate a form to yourself." });
    }

    const teacher = await User.findById(cleanTeacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Selected teacher not found." });
    }

    // Create and save exactly one form for this individual teacher
    const formData = await new Form3({
      isObserverInitiation: true,
      teacherID: teacher._id,
      grenralDetails: {
        NameofObserver: userId,
        DateOfObservation: new Date(),
        className: finalClassName,
        Section: Section,
        Subject: Subject,
      },
      TeacherForm: {},
      ObserverForm: {},
    }).save();

    // The frontend route for BOTH teacher-created and observer-initiated
    // notebook forms is the same: notebook-checking-proforma/create/:id
    const route = `notebook-checking-proforma/create/${formData._id}`;
    if (teacher.email) {
      const emailData = formInitiatedEmail({
        recipientName: teacher.name,
        initiatorName: req.user?.name,
        formTitle: "Notebook Checking Proforma",
        formRoute: route,
        className: finalClassName,
        section: Section,
        subject: Subject,
      });

      try {
        await sendEmail(teacher.email, emailData.subject, emailData.html);
      } catch (emailErr) {
        console.error("Failed to send initiate email:", emailErr);
      }
    }

    // Create and save the notification
    try {
      await new notification({
        title: "You are invited to fill the Notebook Form Initiated",
        route: `notebook-checking-proforma/create/${formData._id}`,
        reciverId: teacher._id,
        date: new Date(),
        status: "unSeen",
      }).save();
    } catch (notifErr) {
      console.error("Failed to create initiate notification:", notifErr);
    }

    recordAuditLog({
      req,
      action: 'CREATE',
      module: 'Notebook Checking',
      details: `Initiated Notebook Checking form for ${teacher.name} (Class: ${finalClassName || ''} Section: ${Section || ''})`,
    });

    return res.status(200).json({ message: "Form created successfully", form: [formData], status: true });
  } catch (err) {
    console.error("Error in createInitiate:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getSignleForm = async (req, res) => {
  const FormID = cleanId(req?.params?.id);
  try {
    if (!FormID || !mongoose.Types.ObjectId.isValid(FormID)) {
      return res.status(404).json({ message: "Form not found." });
    }

    const Form = await Form3.findById(FormID)
      .populate({
        path: "createdBy",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "teacherID",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "grenralDetails.NameofObserver",
        select: "-password -mobile -employeeId -customId",
      });

    if (!Form?._id) {
      return res.status(404).json({ message: "Form not found." });
    }
    res.status(200).send(Form);
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Form not found." });
    }
    console.error("Error Getting NoteBook Checking:", error);
    res
      .status(500)
      .json({ message: "Error Getting NoteBook Checking.", error: error.message });
  }
};

// exports.updateObserverFields = async (req, res) => {
//   const userId = req.user?.id; // Ensure `req.user` exists via middleware
//   const formId = req.params?.id; // Get form ID from URL parameters
//   const {
//     ClassStrength,
//     NotebooksSubmitted,
//     Absentees,
//     Defaulters,
//     observerFeedback,
//     isObserverComplete,
//     maintenanceOfNotebooks,
//     qualityOfOppurtunities,
//     qualityOfTeacherFeedback,
//     qualityOfLearner,
//   } = req.body;

//   try {
//     // Validate user permissions
//     const user = await User.findById(userId).select(
//       "-password -mobile -employeeId -customId"
//     );
//     if (!user || !["Observer", "SuperAdmin"].includes(user.access)) {
//       return res
//         .status(403)
//         .json({ message: "Unauthorized access to update the form." });
//     }

//     // Build the payload dynamically to include only provided fields
//     const payload = {
//       NotebooksObserver: {
//         ClassStrength,
//         NotebooksSubmitted,
//         Absentees,
//         Defaulters,
//       },
//       isObserverComplete: true,
//       ObserverForm: {
//         maintenanceOfNotebooks,
//         qualityOfOppurtunities,
//         qualityOfTeacherFeedback,
//         qualityOfLearner,
//       },
//       observerFeedback,
//       isReflation: false,
//     };

//     // Remove undefined or null values from the payload
//     Object.keys(payload).forEach(
//       (key) => payload[key] === undefined && delete payload[key]
//     );

//     // Update the form directly
//     const form = await Form3.findByIdAndUpdate(
//       formId,
//       { $set: payload },
//       { new: true, runValidators: true } // Return the updated document
//     );

//     // If no form is found, return an error
//     if (!form) {
//       return res.status(404).json({ message: "Form not found." });
//     }

//     // Send the response with the updated form
//     res.status(200).json({
//       success: true,
//       message: "Observer fields updated successfully.",
//       data: form,
//     });
//   } catch (error) {
//     console.error("Error updating observer fields:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while updating the form.",
//       error: error.message,
//     });
//   }
// };

exports.updateObserverFields = async (req, res) => {
    const userId = req.user?.id; // Ensure `req.user` exists via middleware
    const formId = cleanId(req.params?.id); // Get form ID from URL parameters

    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).json({ message: "Valid Form ID is required" });
    }

    const {
        ClassStrength,
        NotebooksSubmitted,
        Absentees,
        Defaulters,
        observerFeedback,
        observerComment,
        isObserverComplete,
        maintenanceOfNotebooks,
        qualityOfOppurtunities,
        qualityOfTeacherFeedback,
        qualityOfLearner,
        isDraft,
        currentStep,
    } = req.body || {};

    try {
        // Validate user permissions
        const observer = await User.findById(userId).select("name email access");
        if (!observer) {
            return res.status(403).json({ message: "Unauthorized access to update the form." });
        }

        // Fetch the form and populate teacher details
        const existingForm = await Form3.findById(formId).populate({
            path: "teacherID",
            select: "name email",
            options: { strictPopulate: false }, // Override strict populate
        })
        .populate({
          path: "createdBy",
          select: "name email",
          options: { strictPopulate: false }, // Override strict populate
        });

        if (!existingForm) {
            return res.status(404).json({ message: "Form not found." });
        }

        // Extract observer details
        const teacher = existingForm?.teacherID || existingForm?.createdBy; 

        // Build the payload dynamically to include only provided fields
        const isDraftSave = isDraft === true;
        const payload = {
            NotebooksObserver: {
                ClassStrength: ClassStrength !== undefined ? ClassStrength : existingForm?.NotebooksObserver?.ClassStrength,
                NotebooksSubmitted: NotebooksSubmitted !== undefined ? NotebooksSubmitted : existingForm?.NotebooksObserver?.NotebooksSubmitted,
                Absentees: Absentees !== undefined ? Absentees : existingForm?.NotebooksObserver?.Absentees,
                Defaulters: Defaulters !== undefined ? Defaulters : existingForm?.NotebooksObserver?.Defaulters,
            },
            isObserverComplete: isDraftSave ? false : (isObserverComplete !== undefined ? isObserverComplete : true),
            isDraft: isDraftSave,
            currentStep: currentStep !== undefined ? currentStep : (existingForm.currentStep || 0),
            ObserverForm: {
                maintenanceOfNotebooks: maintenanceOfNotebooks !== undefined ? maintenanceOfNotebooks : existingForm?.ObserverForm?.maintenanceOfNotebooks,
                qualityOfOppurtunities: qualityOfOppurtunities !== undefined ? qualityOfOppurtunities : existingForm?.ObserverForm?.qualityOfOppurtunities,
                qualityOfTeacherFeedback: qualityOfTeacherFeedback !== undefined ? qualityOfTeacherFeedback : existingForm?.ObserverForm?.qualityOfTeacherFeedback,
                qualityOfLearner: qualityOfLearner !== undefined ? qualityOfLearner : existingForm?.ObserverForm?.qualityOfLearner,
            },
            observerFeedback: observerFeedback !== undefined ? observerFeedback : existingForm?.observerFeedback,
            observerComment: observerComment !== undefined ? observerComment : existingForm?.observerComment,
            isReflation: false,
        };

        // If teacherID is not set (teacher-created flow), copy it from createdBy
        // so GetcreatedByID can reliably find this form for the teacher.
        if (!existingForm.teacherID && existingForm.createdBy) {
            payload.teacherID = existingForm.createdBy._id || existingForm.createdBy;
        }

        // Remove undefined or null values from the payload
        Object.keys(payload).forEach(
            (key) => (payload[key] === undefined || payload[key] === null) && delete payload[key]
        );

        // Update the form directly
        const updatedForm = await Form3.findByIdAndUpdate(
            formId,
            { $set: payload },
            { new: true } // Return the updated document
        );

        if (!updatedForm) {
            return res.status(404).json({ message: "Form not found after update." });
        }

        // Send email to teacher if completed and not a draft
        if (!isDraftSave && teacher?.email) {
          const route = `notebook-checking-proforma/complete/${formId}`;
          const emailData = formCompletedEmail({
            recipientName: teacher.name,
            completorName: observer.name,
            formTitle: "Notebook Checking Proforma",
            formRoute: route,
            role: "Observer",
          });
          try {
            await sendEmail(teacher.email, emailData.subject, emailData.html);
          } catch (emailError) {
            console.error("Failed to send email:", emailError);
          }
        } else if (!isDraftSave) {
          console.warn("Teacher email not found. Skipping email sending.");
        }

        res.status(200).json({
            success: true,
            message: isDraftSave ? "Draft saved successfully." : "Observer fields updated successfully.",
            data: updatedForm,
        });
    } catch (error) {
        console.error("Error updating observer fields:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the form.",
            error: error.message,
        });
    }
};

exports.GetcreatedByID = async (req, res) => {
  const userId = req?.user?.id;
  
  if (!userId) {
    return res.status(403).json({ message: "You do not have permission." });
  }

  try {
    const baseCondition = {
      $or: [
        { teacherID: userId },
        { createdBy: userId, isObserverInitiation: { $ne: true } },
      ],
    };
    const result = await buildNotebookQueryAndPaginate(req, baseCondition);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error Getting NoteBook:", error);
    res.status(500).json({ message: "Error Getting NoteBook.", error });
  }
};


exports.GetObseverForm = async (req, res) => {
  const userId = req?.user?.id;

  try {
    if (!userId) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    const baseCondition = {
      $or: [
        { "grenralDetails.NameofObserver": userId },
        { createdBy: userId, isObserverInitiation: true },
      ],
    };
    const result = await buildNotebookQueryAndPaginate(req, baseCondition);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error Getting NoteBook:", error);
    res.status(500).json({ message: "Error Getting NoteBook.", error });
  }
};

const updatePayload = (existingForm, userRole, changes) => {
  const rolePrefix =
    userRole === "Observer" ? "NotebooksObserver" : "NotebooksTeacher";
  const rolePrefix2 = userRole === "Observer" ? "ObserverForm" : "TeacherForm";

  const fieldMappings = {
    [`${rolePrefix}.ClassStrength`]: changes.ClassStrength,
    [`${rolePrefix}.NotebooksSubmitted`]: changes.NotebooksSubmitted,
    [`${rolePrefix}.Absentees`]: changes.Absentees,
    [`${rolePrefix}.Defaulters`]: changes.Defaulters,
    [`observerFeedback`]: changes.observerFeedback,
    [`isObserverComplete`]: changes.isObserverComplete,
    [`${rolePrefix2}.maintenanceOfNotebooks`]: changes.maintenanceOfNotebooks,
    [`${rolePrefix2}.qualityOfOppurtunities`]: changes.qualityOfOppurtunities,
    [`${rolePrefix2}.qualityOfTeacherFeedback`]:
      changes.qualityOfTeacherFeedback,
    [`${rolePrefix2}.qualityOfLearner`]: changes.qualityOfLearner,
    [`isTeacherComplete`]: changes.isTeacherComplete,
    [`grenralDetails.className`]: changes.className,
    [`grenralDetails.Section`]: changes.Section,
    [`grenralDetails.Subject`]: changes.Subject,
    [`isDraft`]: changes.isDraft,
    [`currentStep`]: changes.currentStep,
  };

  const payload = {};

  for (const [key, currentValue] of Object.entries(fieldMappings)) {
    if (currentValue !== undefined) {
      payload[key] = currentValue;
    }
  }

  return payload;
};

exports.EditUpdateNotebook = async (req, res) => {
    const formId = cleanId(req.params?.id);
    const userRole = req?.user?.access;

    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).json({ message: "Valid Form ID is required" });
    }

    try {
        let finalClassName = undefined;

        if (req.body.className) {
            if (mongoose.Types.ObjectId.isValid(req.body.className) && /^[a-f\d]{24}$/i.test(req.body.className)) {
                const classNameFind = await ClassDetails.findById(req.body.className);
                if (classNameFind) {
                    finalClassName = classNameFind.className;
                } else {
                    finalClassName = req.body.className;
                }
            } else {
                finalClassName = req.body.className;
            }
        }

        const changes = {
            ClassStrength: req.body.ClassStrength,
            NotebooksSubmitted: req.body.NotebooksSubmitted,
            Absentees: req.body.Absentees,
            Defaulters: req.body.Defaulters,
            observerFeedback: req.body.observerFeedback !== undefined ? req.body.observerFeedback : undefined,
            observerComment: req.body.observerComment !== undefined ? req.body.observerComment : undefined,
            isObserverComplete: req.body.isObserverComplete,
            maintenanceOfNotebooks: req.body.maintenanceOfNotebooks,
            qualityOfOppurtunities: req.body.qualityOfOppurtunities,
            qualityOfTeacherFeedback: req.body.qualityOfTeacherFeedback,
            qualityOfLearner: req.body.qualityOfLearner,
            isTeacherComplete: req.body.isTeacherComplete,
            className: finalClassName,
            Subject: req.body.Subject,
            Section: req.body.Section,
            isDraft: req.body.isDraft,
            currentStep: req.body.currentStep,
        };

        const existingForm = await Form3.findById(formId).populate({
            path: 'grenralDetails.NameofObserver',
            select: 'name email',
            options: { strictPopulate: false },
        });

        if (!existingForm) {
            return res.status(404).json({ message: "Form not found", success: false });
        }

        const payload = updatePayload(existingForm, userRole, changes);
        const formDiff = calculateDiff(existingForm, payload);
        let updatedForm = existingForm;
        if (Object.keys(payload).length > 0) {
            updatedForm = await Form3.findByIdAndUpdate(
                formId,
                { $set: payload },
                { new: true }
            );
        }

        if (!updatedForm) {
            return res.status(500).json({ message: "Error updating the form." });
        }

        recordAuditLog({
            req,
            action: 'UPDATE',
            module: 'Notebook Checking',
            targetId: formId,
            details: `Updated Notebook Checking form (ID: ${formId})`,
            changes: formDiff,
        });

        res.status(200).json({
            message: "Form updated successfully!",
            success: true,
            updatedForm,
        });

        // Send email if the teacher completes the form (not a draft)
        if (req.body.isTeacherComplete && !req.body.isDraft) {
            const observerEmail = existingForm?.grenralDetails?.NameofObserver?.email;
            const teacherName = req?.user?.name;
            const observerName = existingForm?.grenralDetails?.NameofObserver?.name;
            if (observerEmail && teacherName) {
              const route = `notebook-checking-proforma/create/${formId}`;
              const emailData = formCompletedEmail({
                recipientName: observerName || "Observer",
                completorName: teacherName,
                formTitle: "Notebook Checking Proforma",
                formRoute: route,
                role: "Teacher",
              });
              try {
                await sendEmail(observerEmail, emailData.subject, emailData.html);
              } catch (err) {
                console.error("Error sending email:", err);
              }
            }
        }
    } catch (error) {
        console.error("Error updating form at:", error.stack || error);
        res.status(500).json({
            message: "Error updating the form.",
            error: error.message,
        });
    }
};

exports.GetNootbookForms = async (req, res) => {
  const userId = req?.user?.id || req?.user?._id;
  if (!userId) {
    return res.status(403).json({ message: "You do not have permission." });
  }

  try {
    const result = await buildNotebookQueryAndPaginate(req, {});
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error Getting Notebook Forms:", error);
    res.status(500).json({ message: "Error Getting Notebook Forms.", error });
  }
};



exports.updateTeacherReflationFeedback = async (req, res) => {
  const id = cleanId(req.params?.id);
  const { reflation } = req.body;

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Populate both createdBy and teacherID — either may identify the teacher
    const form = await Form3.findById(id)
      .populate("createdBy", "name email")
      .populate("teacherID", "name email");

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Save the reflection first so it's never lost even if email fails
    const updatedForm = await Form3.findByIdAndUpdate(
      id,
      {
        teacherReflationFeedback: reflation,
        isReflation: reflation ? true : false,
      },
      { new: true }
    );

    // Resolve teacher — observer-initiated forms use teacherID, teacher-created use createdBy
    const teacher = form.teacherID || form.createdBy;

    // Send email to observer (non-blocking — reflection is already saved above)
    try {
      if (form?.grenralDetails?.NameofObserver) {
        const observer = await User.findById(form.grenralDetails.NameofObserver);

        if (observer?.email && teacher?.name) {
          const route = `notebook-checking-proforma/report/${id}`;
          const emailData = reflectionSubmittedEmail({
            recipientName: observer.name,
            teacherName: teacher.name,
            formTitle: "Notebook Checking Proforma",
            formRoute: route,
          });
          await sendEmail(observer.email, emailData.subject, emailData.html);
        }
      }
    } catch (emailError) {
      console.error("Failed to send reflection email:", emailError);
      // Email failure should not fail the request
    }

    res.status(200).json({
      success: true,
      message: "Reflection updated & email sent to observer",
      form: updatedForm,
    });

  } catch (error) {
    console.error("Error updating teacher reflection feedback:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};



exports.ReminderFormThree = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const formId = cleanId(req?.params?.id);

    if (!userId || !formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Valid User ID and Form ID are required" });
    }

    const [UserDetails, FormDetails] = await Promise.all([
      User.findById(userId),
      Form3.findById(formId)
        .populate({
          path: "teacherID",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: "createdBy",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: `grenralDetails.NameofObserver`,
          select: "-password -mobile -employeeId -customId",
        }),
    ]);

    if (!UserDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!FormDetails) {
      return res.status(404).json({ message: "Form not found" });
    }

    const accessRole = UserDetails?.access;
    if (!["Observer", "Teacher"].includes(accessRole)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Define whether the sender is a Teacher
    const isTeacher = accessRole === "Teacher";

    // Determine sender and receiver
    const sender =
      (isTeacher
        ?( FormDetails?.teacherID?.name || FormDetails?.createdBy?.name)
        :( FormDetails?.grenralDetails?.NameofObserver?.name || FormDetails?.createdBy?.name))

    const receiverName =
      (isTeacher ? ( FormDetails?.grenralDetails?.NameofObserver?.name || FormDetails?.createdBy?.name) 
      :(FormDetails?.teacherID?.name || FormDetails?.createdBy?.name))

    let receiverEmail =
      (isTeacher ? (FormDetails?.grenralDetails?.NameofObserver?.email || FormDetails?.createdBy?.email)
      :(FormDetails?.teacherID?.email || FormDetails?.createdBy?.email))

    if (!receiverEmail) {
      return res.status(400).json({ message: "Recipient email not found" });
    }

    const route = isTeacher
      ? `notebook-checking-proforma/create/${formId}`
      : (!FormDetails?.isTeacherComplete
          ? `notebook-checking-proforma/create/${formId}`
          : `notebook-checking-proforma/complete/${formId}`);

    const emailData = reminderEmail({
      recipientName: receiverName,
      senderName: sender,
      formTitle: "Notebook Checking Proforma",
      formRoute: route,
    });

    try {
      await sendEmail(receiverEmail, emailData.subject, emailData.html);
      recordAuditLog({
        req,
        action: 'REMINDER',
        module: 'Notebook Checking Proforma',
        targetId: String(formId),
        details: `Sent reminder to ${receiverName} (${receiverEmail}) from ${sender}`,
        changes: [
          { field: 'receiverEmail', oldValue: null, newValue: receiverEmail },
          { field: 'formRoute', oldValue: null, newValue: route },
        ],
      });
    } catch (emailErr) {
      console.error("Failed to send reminder email:", emailErr);
    }

    return res.status(200).json({ success: true, message: "Reminder sent successfully." });

  } catch (error) {
    console.error("Error sending reminder:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.deleteFormThree = async (req, res) => {
  const formId = cleanId(req.params?.id);
  try {
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Valid Form ID is required" });
    }
    const deletedForm = await Form3.findByIdAndDelete(formId);
    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found." });
    }
    recordAuditLog({
      req,
      action: 'DELETE',
      module: 'Notebook Checking',
      targetId: formId,
      details: `Deleted Notebook Checking form (ID: ${formId})`,
    });
    res.status(200).json({ message: "Form deleted successfully.", success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Error deleting form.", error: error.message });
  }
};

exports.addObserverComment = async (req, res) => {
  const formId = cleanId(req.params?.id);
  const userId = req.user?.id;
  const comment = req.body?.comment ?? req.body?.overviewComment ?? req.body?.observerComment;

  try {
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ success: false, message: "Valid Form ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const isAllowed =
      user.canAddNotebookComment === true ||
      user.canAddNotebookComment === "true" ||
      user.access === "Superadmin";

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add overview comments on Notebook Checking.",
      });
    }

    const existingForm = await Form3.findById(formId);
    if (!existingForm) {
      return res.status(404).json({ success: false, message: "Notebook Checking form not found." });
    }

    const isTeacherDone = Boolean(existingForm.isTeacherComplete);
    const isObserverDone = Boolean(existingForm.isObserverComplete);
    const isReflectionDone = Boolean(existingForm.isReflation);

    if (!isTeacherDone || !isObserverDone || !isReflectionDone) {
      return res.status(400).json({
        success: false,
        message:
          "Overview comment can only be added when the form has been completed by both teacher and observer, and reflection has been submitted.",
      });
    }

    const cleanComment = typeof comment === "string" ? comment.trim() : "";
    const updatedForm = await Form3.findByIdAndUpdate(
      formId,
      {
        $set: {
          observerComment: cleanComment,
        },
      },
      { new: true }
    );

    recordAuditLog({
      req,
      action: 'OVERVIEW_COMMENT',
      module: 'Notebook Checking',
      targetId: formId,
      details: `Added overview comment: "${cleanComment.substring(0, 50)}${cleanComment.length > 50 ? '...' : ''}"`,
      changes: [{ field: 'observerComment', oldValue: existingForm.observerComment || null, newValue: cleanComment }],
    });

    return res.status(200).json({
      success: true,
      message: "Overview comment saved successfully.",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error saving notebook overview comment:", error);
    return res.status(500).json({ success: false, message: "Failed to save comment", error: error.message });
  }
};
