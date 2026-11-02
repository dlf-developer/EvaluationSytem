const mongoose = require("mongoose");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const { formInitiatedEmail, formCompletedEmail, reminderEmail } = require("../utils/emailTemplates");
const Form1 = require("../models/Form1");
const Notification = require("../models/notification");
const ClassDetails = require("../models/ClassDetails");
const activity = require("../models/Activity");
const { recordAuditLog, calculateDiff } = require("../utils/auditLogger");

//jab teacher form 1 ko direct init karta hai tab ye function kam karta hai

exports.createForm = async (req, res) => {
  const {
    className,
    section,
    date,
    isCoordinator,
    coordinatorID,
    isTeacher,
    teacherID,
  } = req.body;
  const userId = req?.user?.id;
  try {
    let recipientEmail = "";
    let reciverId = "";
    let formData;

    // Determine the recipient based on role
    if (isCoordinator && coordinatorID) {
      if (coordinatorID.toString() === userId.toString()) {
        return res.status(400).json({ message: "You cannot assign yourself as the coordinator/observer." });
      }
      const coordinator = await User.findById(coordinatorID);
      if (coordinator?.email) {
        recipientEmail = coordinator.email;
        reciverId = coordinator._id;
      }

      let finalClassName = className;
      if (className && mongoose.Types.ObjectId.isValid(className) && /^[a-f\d]{24}$/i.test(className)) {
        const classData = await ClassDetails.findById(className);
        if (classData) finalClassName = classData.className;
      } else if (className) {
        const classData = await ClassDetails.findOne({ className });
        if (classData) finalClassName = classData.className;
      }

      if (!finalClassName) {
        return res
          .status(400)
          .json({ success: false, message: " Class and Section is Required!" });
      }

      formData = new Form1({
        userId,
        className: finalClassName,
        section,
        date: new Date(date),
        isCoordinator,
        coordinatorID,
        isTeacher,
        observerForm: {}, // Defaults will apply
        teacherForm: {}, // Defaults will apply
      });
    } else if (isTeacher && teacherID) {
      if (teacherID.toString() === userId.toString()) {
        return res.status(400).json({ message: "You cannot assign yourself as the teacher." });
      }
      const teacher = await User.findById(teacherID);
      if (teacher?.email) {
        recipientEmail = teacher.email;
        reciverId = teacher._id;
      }

      let finalClassName = className;
      if (className && mongoose.Types.ObjectId.isValid(className) && /^[a-f\d]{24}$/i.test(className)) {
        const classData = await ClassDetails.findById(className);
        if (classData) finalClassName = classData.className;
      } else if (className) {
        const classData = await ClassDetails.findOne({ className });
        if (classData) finalClassName = classData.className;
      }

      formData = new Form1({
        userId,
        className: finalClassName,
        section,
        date: new Date(date),
        isCoordinator,
        isTeacher,
        teacherID,
        observerForm: {}, // Defaults will apply
        teacherForm: {}, // Defaults will apply
      });
    }

    // Save the form
    if (!formData) {
      return res.status(400).json({
        message:
          "Invalid data. Either coordinator or teacher details are required.",
      });
    }

    await formData.save();

    recordAuditLog({
      req,
      action: 'CREATE',
      module: 'Fortnightly Monitor',
      targetId: formData._id,
      details: `Created Fortnightly Monitor form (Class: ${formData.className || ''} Section: ${section || ''})`,
    });

    const initiatorName = req?.user?.name || "Teacher";
    const tactivity = new activity({
      userId: userId,
      title: "Fortnightly Monitor",
      className: formData.className,
      section: section,
      userName: initiatorName,
      form1: {
        message: `A new Fortnightly Monitor form has been created by ${initiatorName}`,
        router: `/fortnightly-monitor/create/${formData._id}`,
      },
    });
    await tactivity.save();

    // Send email and notification if recipient exists
    if (recipientEmail) {
      const route = `fortnightly-monitor/create/${formData._id}`;
      const emailData = formInitiatedEmail({
        recipientName: isCoordinator ? (await User.findById(coordinatorID))?.name : (await User.findById(teacherID))?.name,
        initiatorName: initiatorName,
        formTitle: "Fortnightly Monitor",
        formRoute: route,
        className: formData.className,
        section,
      });
      sendEmail(recipientEmail, emailData.subject, emailData.html).catch(e => console.error("Email error:", e));

      const notifications = new Notification({
        title: "You are invited to fill the Fortnightly Monitor Form",
        route,
        reciverId,
        date: new Date(),
        status: "unSeen",
      });
      await notifications.save();
    }
    res.status(201).json({
      message: "Fortnightly Monitor created successfully!",
      form: formData,
    });
  } catch (error) {
    console.error("Error creating Fortnightly Monitor:", error);
    res
      .status(500)
      .json({ message: "Error creating Fortnightly Monitor.", error });
  }
};

// jab observer form 1 ko init karata hai tab ye function kam karta hai
exports.FormInitiation = async (req, res) => {
  const { isTeacher, teacherIDs, className, section } = req.body;
  const userId = req?.user?.id;
  const userIdName = req?.user?.name;
  let FormData;
  try {
    let finalClassName = className;
    if (className && mongoose.Types.ObjectId.isValid(className)) {
      const classData = await ClassDetails.findById(className);
      if (classData) finalClassName = classData.className;
    }

    if (isTeacher && Array.isArray(teacherIDs) && teacherIDs.length > 0) {
      const teacherForms = await Promise.all(
        teacherIDs.map(async (item) => {
          if (item.toString() === userId.toString()) return null;
          const teacher = await User.findById({ _id: item });
          if (teacher?.email) {
            const formData = new Form1({
              userId,
              isTeacher,
              isObserverInitiation: true,
              observerForm: {},
              teacherForm: {},
              teacherID: teacher?._id,
              date: new Date(),
              className: finalClassName,
              section,
            });

            // Save the form
            FormData = await formData.save();

            // Save activity log
            const newActivity = new activity({
              userId,
              title: "Fortnightly Monitor",
              form1: {
                message: "Fortnightly Monitor Form Created",
                router: `fortnightly-monitor/create/${formData._id}`,
              },
            });
            await newActivity.save();

            const notification = new Notification({
              title: "You are invited to fill the Fortnightly Monitor Form",
              route: `fortnightly-monitor/create/${formData._id}`,
              reciverId: teacher._id,
              date: new Date(),
              status: "unSeen",
            });
            await notification.save();

            return formData;
          }
          return null;
        }),
      );
      const checkForm = await Form1.findById(FormData._id).populate(
        "teacherID coordinatorID userId",
      );
      const validForms = teacherForms.filter((form) => form !== null);
      const recipientEmail = checkForm?.teacherID?.email;
      const recipientName  = checkForm?.teacherID?.name;
      const route = `fortnightly-monitor/create/${FormData._id}`;
      const emailData = formInitiatedEmail({
        recipientName,
        initiatorName: checkForm?.coordinatorID?.name || checkForm?.userId?.name,
        formTitle: "Fortnightly Monitor",
        formRoute: route,
        className: checkForm?.className,
        section: checkForm?.section,
      });
      if (recipientEmail) {
        await sendEmail(recipientEmail, emailData.subject, emailData.html);
      }

      if (validForms.length > 0) {
        recordAuditLog({
          req,
          action: 'CREATE',
          module: 'Fortnightly Monitor',
          details: `Initiated Fortnightly Monitor for ${validForms.length} teacher(s) (Class: ${className || ''} Section: ${section || ''})`,
        });
        return res.status(201).json({
          message: "Fortnightly Monitor created successfully!",
          forms: validForms,
        });
      }
    }

    return res.status(400).json({
      message:
        "Invalid data. Either coordinator or teacher details are required.",
    });
  } catch (error) {
    console.error("Error creating Fortnightly Monitor:", error);
    res
      .status(500)
      .json({ message: "Error creating Fortnightly Monitor.", error });
  }
};

// ── Shared Helper for Server-Side Filtering, Pagination (limit/skip) & Count ───
const buildFormOneQueryAndPaginate = async (req, baseCondition = {}) => {
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
      queryFilter.className = {
        $in: [...classNames, ...matchingIds],
      };
    }
  }

  // 3. Section filter
  if (req.query.section) {
    const sections = req.query.section
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sections.length > 0) {
      queryFilter.section = { $in: sections };
    }
  }

  // 4. Date filter
  if (req.query.date || req.query.observationDate) {
    const d = new Date(req.query.date || req.query.observationDate);
    if (!isNaN(d.getTime())) {
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      queryFilter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
  }

  // 5. Completion filters
  if (
    req.query.isTeacherComplete !== undefined &&
    req.query.isTeacherComplete !== null &&
    req.query.isTeacherComplete !== ""
  ) {
    queryFilter.isTeacherComplete = String(req.query.isTeacherComplete) === "true";
  }
  if (
    req.query.isCoordinatorComplete !== undefined &&
    req.query.isCoordinatorComplete !== null &&
    req.query.isCoordinatorComplete !== ""
  ) {
    queryFilter.isCoordinatorComplete = String(req.query.isCoordinatorComplete) === "true";
  }

  // 6. Person search
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

      const searchOr = [
        { teacherID: { $in: matchedIds } },
        { coordinatorID: { $in: matchedIds } },
        { userId: { $in: matchedIds } },
      ];

      if (queryFilter.$or) {
        queryFilter.$and = [
          { $or: queryFilter.$or },
          { $or: searchOr },
        ];
        delete queryFilter.$or;
      } else {
        queryFilter.$or = searchOr;
      }
    }
  }

  // 7. Pagination params (limit & skip)
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

  const totalCount = await Form1.countDocuments(queryFilter);

  let dbQuery = Form1.find(queryFilter)
    .sort({ date: -1, createdAt: -1 })
    .populate({
      path: "teacherID",
      select: "-password -mobile -employeeId -customId",
    })
    .populate({
      path: "userId",
      select: "-password -mobile -employeeId -customId",
    })
    .populate({
      path: "coordinatorID",
      select: "-password -mobile -employeeId -customId",
    });

  if (!isAll && limit > 0) {
    dbQuery = dbQuery.skip(skip).limit(limit);
  }

  const forms = await dbQuery.lean();

  try {
    const classDetailsList = await ClassDetails.find({}).lean();
    const classMap = {};
    classDetailsList.forEach((c) => {
      if (c?._id) classMap[c._id.toString()] = c.className;
    });

    forms.forEach((form) => {
      if (form.className && classMap[form.className.toString()]) {
        form.className = classMap[form.className.toString()];
      }
    });
  } catch (e) {
    console.error("Error resolving class names in Form 1:", e);
  }

  let filterOptions = { classes: [], sections: [] };
  try {
    const allClasses = await ClassDetails.find({}, "className").lean();
    const distinctSections = await Form1.distinct("section", {
      section: { $ne: null },
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

exports.getuserForm = async (req, res) => {
  const userId = req?.user?.id;
  if (!userId) {
    return res.status(403).json({ message: "You do not have permission." });
  }
  try {
    const baseCondition = {
      $or: [{ userId }, { teacherID: userId }],
    };
    const result = await buildFormOneQueryAndPaginate(req, baseCondition);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Error in getuserForm:", err);
    res.status(400).send(err);
  }
};

exports.GetObseverForm1 = async (req, res) => {
  const userId = req?.user?.id;
  if (!userId) {
    return res.status(403).json({ message: "You do not have permission." });
  }
  try {
    const baseCondition = {
      $or: [{ coordinatorID: userId }, { isObserverInitiation: true }],
    };
    const result = await buildFormOneQueryAndPaginate(req, baseCondition);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error Getting Fortnightly Monitor Observer Forms:", error);
    res.status(500).json({ message: "Error Getting Fortnightly Monitor.", error });
  }
};

exports.getSingleuserForm = async (req, res) => {
  const formId = req?.params.id;
  try {
    const data = await Form1.findById(formId)
      .populate("teacherID", "-password") // Exclude password field
      .populate("coordinatorID", "-password") // Exclude password field
      .populate("userId", "-password"); // Exclude password field
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(err);
  }
};

//jab teacher and observer dono  form 1 ko fill karta hai jab obverser init kya uske bad

exports.FormFill = async (req, res) => {
  const formId = req.params.id;
  try {
    const data = await Form1.findById(formId);
    const {
      isCoordinatorComplete,
      isTeacherComplete,
      observerForm,
      teacherForm,
      className,
      date,
      Section,
    } = req.body;

    let FindClass = null;
    if (className && mongoose.Types.ObjectId.isValid(className)) {
      FindClass = await ClassDetails.findById(className);
    }

    // if (!isCoordinatorComplete && !isTeacherComplete && !data?.isObserverInitiation && (!className || !date || !Section)) {
    //   res.status(400).json({
    //     message: 'All fields are required',
    //   });
    // }

    // Check if the formId is provided
    if (!formId) {
      return res.status(400).json({
        message: "Form ID is required",
      });
    }

    // Helper to calculate score and valid questions count
    const computeScores = (formDataObj) => {
      let score = 0;
      let outOf = 0;
      const validOptions = ["Yes", "No", "Sometimes"];
      if (formDataObj && typeof formDataObj === "object") {
        Object.entries(formDataObj).forEach(([k, v]) => {
          if (k !== "_id" && k !== "totalScore" && k !== "OutOf" && k !== "ObservationDates") {
            if (v === "Yes") score += 1;
            else if (v === "Sometimes") score += 0.5;
            if (validOptions.includes(v)) outOf += 1;
          }
        });
      }
      return { score, outOf };
    };

    // Deep merge to prevent step drafts from wiping previous step answers
    const getMergedForm = (existingDoc, incomingData) => {
      const existing = existingDoc ? (existingDoc.toObject ? existingDoc.toObject() : existingDoc) : {};
      const merged = { ...existing, ...(incomingData || {}) };
      delete merged._id;
      const { score, outOf } = computeScores(merged);
      merged.totalScore = score;
      merged.OutOf = outOf;
      return merged;
    };

    // Create an object to store the updates
    let updateData = {};
    const isDraft = req.body.isDraft !== undefined ? req.body.isDraft : (!isCoordinatorComplete && !isTeacherComplete);
    const currentStep = req.body.currentStep !== undefined ? req.body.currentStep : (data?.currentStep || 0);

    if (isCoordinatorComplete) {
      const mergedObserver = getMergedForm(data?.observerForm, observerForm);
      if (!mergedObserver.OutOf || mergedObserver.OutOf === 0) {
        return res.status(400).json({
          message: "Cannot mark observer evaluation complete without answered questions.",
        });
      }
      updateData = {
        isCoordinatorComplete,
        isDraft: false,
        currentStep: 3,
        ObserverSubmissionDate: new Date(),
        observerForm: mergedObserver,
      };
    } else if (isTeacherComplete) {
      const mergedTeacher = getMergedForm(data?.teacherForm, teacherForm);
      if (!mergedTeacher.OutOf || mergedTeacher.OutOf === 0) {
        return res.status(400).json({
          message: "Cannot mark teacher evaluation complete without answered questions.",
        });
      }
      updateData = {
        isTeacherComplete,
        isDraft: false,
        currentStep: 0, // Reset to 0 for observer who evaluates next
        TeacherSubmissionDate: new Date(),
        teacherForm: mergedTeacher,
        className: FindClass?.className || className || data?.className,
        date: date || data?.date,
        section: Section || data?.section,
      };
    } else {
      // Step-by-step draft persistence with non-destructive merge
      updateData = {
        isDraft: true,
        currentStep,
        ...(observerForm ? { observerForm: getMergedForm(data?.observerForm, observerForm) } : {}),
        ...(teacherForm ? { teacherForm: getMergedForm(data?.teacherForm, teacherForm) } : {}),
        ...(className || FindClass ? { className: FindClass?.className || className } : {}),
        ...(date ? { date } : {}),
        ...(Section ? { section: Section } : {}),
      };
    }

    // Update the form based on the formId
    const formDiff = calculateDiff(data, updateData);
    const updatedForm = await Form1.findByIdAndUpdate(formId, updateData, {
      new: true,
    }).populate("teacherID coordinatorID userId");

    // If no form was found, return a 404 error
    if (!updatedForm) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'Fortnightly Monitor',
      targetId: formId,
      details: `Updated Fortnightly Monitor form (ID: ${formId})`,
      changes: formDiff,
    });
    const recipientEmail =
      updatedForm?.userId?.email || updatedForm?.userId?.email;
    const recipientName =
      updatedForm?.userId?.name || updatedForm?.userId?.name;

    if (updatedForm?.isCoordinatorComplete) {
      const route = `fortnightly-monitor/create/${updatedForm?._id}`;
      const emailData = formCompletedEmail({
        recipientName: updatedForm?.teacherID?.name || updatedForm?.userId?.name,
        completorName: updatedForm?.coordinatorID?.name || updatedForm?.userId?.name,
        formTitle: "Fortnightly Monitor",
        formRoute: route,
        role: "Observer",
      });
      await sendEmail(updatedForm?.teacherID?.email || updatedForm?.userId?.email, emailData.subject, emailData.html);
    }

    if (updatedForm?.isTeacherComplete) {
      const route = `fortnightly-monitor/create/${updatedForm?._id}`;
      const notifications = new Notification({
        title: `${updatedForm?.teacherID?.name} has completed the form — now it's your turn!`,
        route,
        reciverId: updatedForm?.userId?._id,
        date: new Date(),
        status: "unSeen",
      });
      const emailData = formCompletedEmail({
        recipientName: updatedForm?.coordinatorID?.name || updatedForm?.userId?.name,
        completorName: updatedForm?.teacherID?.name || updatedForm?.userId?.name,
        formTitle: "Fortnightly Monitor",
        formRoute: route,
        role: "Teacher",
      });
      await sendEmail(updatedForm?.coordinatorID?.email || updatedForm?.userId?.email, emailData.subject, emailData.html);
      await notifications.save();
    }

    const userId = updatedForm?.userId?._id;
    const teacherId = updatedForm?.teacherID?._id;

    const updateOrCreateActivity = async (userId, message) => {
      if (!userId) {
        console.log("No userId found, skipping activity creation.");
        return;
      }

      try {
        const existingActivity = await activity.findOne({
          userId,
          "form1.router": `fortnightly-monitor/create/${updatedForm?._id}`,
        });

        if (existingActivity && existingActivity.form1.message === message) {
          console.log(
            `⚠️ Activity with the same message already exists for User ID: ${userId}. Skipping.`,
          );
        } else {
          await activity.create({
            userId,
            form1: {
              message,
              router: `fortnightly-monitor/create/${updatedForm?._id}`,
            },
            title: "Fortnightly Monitor",
          });
        }
      } catch (error) {
        console.error("Error saving activity:", error);
      }
    };
    (async () => {
      if (updatedForm?.isCoordinatorComplete) {
        await updateOrCreateActivity(
          userId,
          "Observer has completed the form. Please review.",
        );
      }
      if (updatedForm?.isTeacherComplete) {
        await updateOrCreateActivity(
          teacherId,
          "Teacher has completed the form. Please review.",
        );
      }
    })();

    // Send a success response with the updated form
    res.status(200).json({
      message: "Form updated successfully!",
      form: updatedForm,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating the form.",
      error: error.message,
    });
  }
};

// 5. Get Forms to Display on Observer's Dashboard
exports.getObserverDashboard = async (req, res) => {
  const { observerID, TeacherID } = req.body;
  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    let forms;
    if (observerID) {
      forms = await Form1.find({
        isCoordinatorComplete: false,
        coordinatorID: observerID,
        ...queryFilter,
      })
        .populate("teacherID", "-password") // Exclude password field
        .populate("coordinatorID", "-password") // Exclude password field
        .populate("userId", "-password"); // Exclude password field
    } else if (TeacherID) {
      forms = await Form1.find({
        isTeacherComplete: false,
        teacherID: TeacherID,
        ...queryFilter,
      })
        .populate("teacherID", "-password") // Exclude password field
        .populate("coordinatorID", "-password") // Exclude password field
        .populate("userId", "-password"); // Exclude password field
    }

    if (forms?.length === 0) {
      return res.status(404).json({
        message: "No Fortnightly Monitor Forms available for filling.",
      });
    }

    res.status(200).json({ forms });
  } catch (error) {
    console.error("Error fetching dashboard data for observer:", error);
    res.status(500).json({ message: "Error fetching dashboard data.", error });
  }
};

exports.GetFormOneAdmin = async (req, res) => {
  const userId = req?.user?.id;
  if (!userId) {
    return res.status(403).json({ message: "You do not have permission." });
  }

  try {
    const result = await buildFormOneQueryAndPaginate(req, {});
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error Getting Form One Admin:", error);
    res.status(500).json({ message: "Error Getting Form One.", error });
  }
};

// exports.RemiderFormOne = async (req, res) => {
//   const userId = req?.user?.id;
//   const formId = req?.params?.id
//   try {
//     const UserDetails = await User.findById(userId);
//     const FormDetails =await Form1.findById(formId);
//     if(!FormDetails){
//       res.status(400).json({message:"Form not found"})
//     }
//     if(UserDetails?.access === "Obserevr"){
//       const subject = 'Reminder: Fortnightly Monitor Form Submission Pending';
//       const body = `
// Dear ${FormDetails?.teacherID?.name || FormDetails?.userId?.name},
// This is a gentle reminder from ${FormDetails?.coordinatorID?.name || FormDetails?.userId?.name} to complete your section of the Fortnightly Monitor form at the earliest.
// Regards,
// The Admin Team

//                       `;

//       await sendEmail((FormDetails?.teacherID?.email || FormDetails?.userId?.email), subject, body);

//       res.status(200).send({success:true})
//     }

//     if(UserDetails?.access === "Teacher"){
//       const subject = 'Reminder: Fortnightly Monitor Form Submission Pending';
//       const body = `
// Dear ${FormDetails?.coordinatorID?.name || FormDetails?.userId?.name},
// This is a gentle reminder from  ${FormDetails?.teacherID?.name || FormDetails?.userId?.name} to complete your section of the Fortnightly Monitor form at the earliest.
// Regards,
// The Admin Team
//                       `;

//       await sendEmail((FormDetails?.coordinatorID?.email || FormDetails?.userId?.email), subject, body);
//       res.status(200).send({success:true})
//     }
//   } catch (error) {
//     res.status(200).send({message: error.message})
//   }
// }

exports.ReminderFormOne = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const formId = req?.params?.id;

    const [UserDetails, FormDetails] = await Promise.all([
      User.findById(userId),
      Form1.findById(formId)
        .populate({
          path: "teacherID",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: "userId",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: "coordinatorID",
          select: "-password -mobile -employeeId -customId",
        }),
    ]);

    if (!FormDetails) {
      return res.status(400).json({ message: "Form not found" });
    }

    const accessRole = UserDetails?.access;
    if (!["Observer", "Teacher"].includes(accessRole)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const isObserver = accessRole === "Observer";
    const sender = isObserver
      ? FormDetails?.coordinatorID?.name || FormDetails?.userId?.name
      : FormDetails?.teacherID?.name || FormDetails?.userId?.name;
    const receiverName = isObserver
      ? FormDetails?.teacherID?.name || FormDetails?.userId?.name
      : FormDetails?.coordinatorID?.name || FormDetails?.userId?.name;
    const receiverEmail = isObserver
      ? FormDetails?.teacherID?.email || FormDetails?.userId?.email
      : FormDetails?.coordinatorID?.email || FormDetails?.userId?.email;

    const route = `fortnightly-monitor/create/${FormDetails?._id}`;
    const emailData = reminderEmail({
      recipientName: receiverName,
      senderName: sender,
      formTitle: "Fortnightly Monitor",
      formRoute: route,
    });
    await sendEmail(receiverEmail, emailData.subject, emailData.html);

    recordAuditLog({
      req,
      action: 'REMINDER',
      module: 'Fortnightly Monitor',
      targetId: String(formId),
      details: `Sent reminder to ${receiverName} (${receiverEmail}) from ${sender}`,
      changes: [
        { field: 'receiverEmail', oldValue: null, newValue: receiverEmail },
        { field: 'formRoute', oldValue: null, newValue: route },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending reminder:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.deleteFormOne = async (req, res) => {
  const formId = req.params.id;
  try {
    const deletedForm = await Form1.findByIdAndDelete(formId);
    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found." });
    }
    recordAuditLog({
      req,
      action: 'DELETE',
      module: 'Fortnightly Monitor',
      targetId: formId,
      details: `Deleted Fortnightly Monitor form (ID: ${formId})`,
    });
    res.status(200).json({ message: "Form deleted successfully.", success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Error deleting form.", error: error.message });
  }
};
