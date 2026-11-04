const mongoose = require('mongoose');
const { createNotification } = require('../config/notify');
const ClassDetails = require('../models/ClassDetails');
const Form2 = require('../models/Form2');
const notification = require('../models/notification');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const { formInitiatedEmail, formCompletedEmail, reminderEmail } = require('../utils/emailTemplates');
const { recordAuditLog, calculateDiff } = require('../utils/auditLogger');

const resolveClassNames = async (forms) => {
    if (!forms) return forms;
    const formArray = Array.isArray(forms) ? forms : [forms];
    if (!formArray.length) return forms;
    try {
        const classDetailsList = await ClassDetails.find({}).lean();
        const classMap = {};
        classDetailsList.forEach((c) => {
            if (c?._id) classMap[c._id.toString()] = c.className;
        });

        formArray.forEach((form) => {
            const currentClassName = form?.grenralDetails?.className;
            if (currentClassName && classMap[currentClassName.toString()]) {
                form.grenralDetails.className = classMap[currentClassName.toString()];
            }
        });
    } catch (err) {
        console.error("Error resolving class names:", err);
    }
    return forms;
};

const resolveSingleFormClassName = async (form) => {
    if (!form || !form.grenralDetails?.className) return form;
    try {
        const currentClassName = form.grenralDetails.className;
        if (mongoose.Types.ObjectId.isValid(currentClassName) && /^[a-f\d]{24}$/i.test(currentClassName)) {
            const classData = await ClassDetails.findById(currentClassName).lean();
            if (classData?.className) {
                form.grenralDetails.className = classData.className;
            }
        }
    } catch (err) {
        console.error("Error resolving single form class name:", err);
    }
    return form;
};

const resolveClassNameFromInput = async (className) => {
    if (!className) return className;
    try {
        if (mongoose.Types.ObjectId.isValid(className) && /^[a-f\d]{24}$/i.test(className)) {
            const classData = await ClassDetails.findById(className).lean();
            if (classData?.className) {
                return classData.className;
            }
        }
        const classDataByName = await ClassDetails.findOne({ className }).lean();
        if (classDataByName?.className) {
            return classDataByName.className;
        }
    } catch (err) {
        console.error("Error resolving input class name:", err);
    }
    return className;
};

// ── Shared Helper for Server-Side Filtering, Pagination (limit/skip) & Count ───
const buildClassroomQueryAndPaginate = async (req, baseCondition = {}) => {
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

  // 3. Section filter
  if (req.query.section) {
    const sections = req.query.section
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (sections.length > 0) {
      queryFilter["grenralDetails.Section"] = { $in: sections };
    }
  }

  // 4. Subject filter
  if (req.query.subject) {
    const subjects = req.query.subject
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (subjects.length > 0) {
      queryFilter["grenralDetails.Subject"] = { $in: subjects };
    }
  }

  // 5. Date of Observation
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

  // 6. Boolean completion filters
  if (
    req.query.isTeacherCompletes !== undefined &&
    req.query.isTeacherCompletes !== null &&
    req.query.isTeacherCompletes !== ""
  ) {
    queryFilter.isTeacherCompletes = String(req.query.isTeacherCompletes) === "true";
  }
  if (
    req.query.isObserverCompleted !== undefined &&
    req.query.isObserverCompleted !== null &&
    req.query.isObserverCompleted !== ""
  ) {
    queryFilter.isObserverCompleted = String(req.query.isObserverCompleted) === "true";
  }

  // 7. Person & Name search
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
      andConditions.push({
        $or: [
          { teacherID: { $in: matchedIds } },
          { "grenralDetails.NameoftheVisitingTeacher": { $in: matchedIds } },
          { "grenralDetails.NameoftheTeacher": { $in: matchedIds } },
        ],
      });
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
          { "grenralDetails.NameoftheVisitingTeacher": { $in: matchedIds } },
          { "grenralDetails.NameoftheTeacher": { $in: matchedIds } },
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

  const totalCount = await Form2.countDocuments(queryFilter);

  // Parse sorting params
  const { parseSortParams } = require("../utils/sortHelper");
  const form2SortMap = {
    observationDate: "grenralDetails.DateOfObservation",
    date: "grenralDetails.DateOfObservation",
    className: "grenralDetails.className",
    section: "grenralDetails.Section",
    subject: "grenralDetails.Subject",
    topic: "grenralDetails.Topic",
    personName: "grenralDetails.NameoftheVisitingTeacher",
    teacherName: "grenralDetails.NameoftheVisitingTeacher",
    observerName: "createdBy",
    totalScores: "totalScores",
    scoreOutof: "scoreOutof",
    percentageScore: "percentageScore",
    Grade: "Grade",
    grade: "Grade",
    isTeacherCompletes: "isTeacherCompletes",
    isObserverCompleted: "isObserverCompleted",
    createdAt: "createdAt",
  };
  const sortCriteria = parseSortParams(req.query, form2SortMap, { createdAt: -1 });

  let dbQuery = Form2.find(queryFilter)
    .sort(sortCriteria)
    .populate({
      path: "teacherID",
      select: "-password -mobile -employeeId -customId",
    })
    .populate({
      path: "createdBy",
      select: "-password -mobile -employeeId -customId",
    })
    .populate({
      path: "grenralDetails.NameoftheVisitingTeacher",
      select: "-password -mobile -employeeId -customId",
    });

  if (!isAll && limit > 0) {
    dbQuery = dbQuery.skip(skip).limit(limit);
  }

  const forms = await dbQuery.lean();
  await resolveClassNames(forms);

  // Distinct filter options
  let filterOptions = { classes: [], sections: [] };
  try {
    const allClasses = await ClassDetails.find({}, "className").lean();
    const distinctSections = await Form2.distinct("grenralDetails.Section", {
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
        NameoftheVisitingTeacher,
        DateOfObservation,
        className,
        Section,
        Subject,
        Topic,
        essentialAggrements,
        planingAndPreparation,
        classRoomEnvironment,
        instruction,
        totalScores,
        scoreOutof,
        percentageScore,
        Grade,
        NumberofParametersNotApplicable,
        isObserverCompleted,
        ObserverFeedback,
    } = req.body;
    const userId = req?.user?.id;

    try {
        // Fetch user details without sensitive fields
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        // Check if the user has access as "Observer" or "SuperAdmin" or dual role
        const isObserverOrAdmin = user && (user.access === "Observer" || user.isDualRole || user.access === "SuperAdmin" || user.access === "Superadmin");
        if (!isObserverOrAdmin) {
            return res.status(403).json({ message: "You do not have permission to create this form." });
        }

        // Ensure that the NameoftheVisitingTeacher is provided
        if (!NameoftheVisitingTeacher) {
            return res.status(400).json({ message: "Name of the Visiting Teacher is required." });
        }

        // Prevent self-observation
        if (NameoftheVisitingTeacher.toString() === userId.toString()) {
            return res.status(400).json({ message: "An observer cannot observe or evaluate themselves." });
        }

        const resolvedClassName = await resolveClassNameFromInput(className);
        if (!resolvedClassName) {
            return res.status(400).json({ success: false, message: " Class and Section is Required!" });
        }

        // Create the new form data
        const newForm = new Form2({
            createdBy: userId,
            isObserverCompleted: ObserverFeedback ? true : false, // Default to `false` if not provided
            ObserverFeedback: ObserverFeedback || [], // Default to an empty array
            isTeacherCompletes: false,
            grenralDetails: {
                NameoftheVisitingTeacher,
                DateOfObservation: DateOfObservation || new Date(), // Use current date if not provided
                className: resolvedClassName,
                Section,
                Subject,
                Topic,
            },
            essentialAggrements,
            planingAndPreparation,
            classRoomEnvironment,
            instruction,
            totalScores,
            scoreOutof,
            percentageScore,
            Grade,
            NumberofParametersNotApplicable,
        });
        // Save the form to the database
        const savedForm = await newForm.save();

        const recipientUser = await User.findById(NameoftheVisitingTeacher);

        recordAuditLog({
            req,
            action: 'CREATE',
            module: 'Classroom Walkthrough',
            targetId: savedForm._id,
            details: `Created Classroom Walkthrough form for ${recipientUser?.name || 'Teacher'} (Class: ${resolvedClassName || ''} Section: ${Section || ''})`,
        });
        const notification = await createNotification({
            title: 'You are invited to fill the Classroom Walkthrough',
            route: `classroom-walkthrough/create/${savedForm._id}`,
            reciverId: NameoftheVisitingTeacher,
        });

        if (recipientUser?.email) {
            const route = `classroom-walkthrough/create/${savedForm._id}`;
            const emailData = formInitiatedEmail({
              recipientName: recipientUser?.name,
              initiatorName: user.name,
              formTitle: "Classroom Walkthrough",
              formRoute: route,
              className: resolvedClassName,
              section: Section,
              subject: Subject,
            });
            await sendEmail(recipientUser.email, emailData.subject, emailData.html);
        }

        // Send success response
        res.status(201).json({ message: "Form created successfully", form: savedForm, status: true });
    } catch (error) {
        console.error("Error creating Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error creating Classroom Walkthrough.", status: false, error });
    }
};


exports.editWalkthrouForm = async (req, res) => {
    const {
        NameoftheVisitingTeacher,
        DateOfObservation,
        className,
        Section,
        Subject,
        Topic,
        essentialAggrements,
        planingAndPreparation,
        classRoomEnvironment,
        instruction,
        totalScores,
        scoreOutof,
        percentageScore,
        Grade,
        NumberofParametersNotApplicable,
        isObserverCompleted,
        ObserverFeedback,
    } = req.body;
    const userId = req?.user?.id;
    const formId = req.params.id;

    try {
        // Fetch user details without sensitive fields
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        // Check if the user has access as "Observer" or "SuperAdmin" or dual role
        const isObserverOrAdmin = user && (user.access === "Observer" || user.isDualRole || user.access === "SuperAdmin" || user.access === "Superadmin");
        if (!isObserverOrAdmin) {
            return res.status(403).json({ message: "You do not have permission to edit this form." });
        }

        // Check if the form exists
        const form = await Form2.findById(formId);
        if (!form) {
            return res.status(404).json({ message: "Form does not exist." });
        }

        // Prepare the update values
        const UpdateValue = {};

        // Dynamically add fields to the UpdateValue object if they are provided in the request body
        if (NameoftheVisitingTeacher) UpdateValue["grenralDetails.NameoftheVisitingTeacher"] = NameoftheVisitingTeacher;
        if (DateOfObservation) UpdateValue["grenralDetails.DateOfObservation"] = DateOfObservation;
        if (className) {
            const resolvedClassName = await resolveClassNameFromInput(className);
            UpdateValue["grenralDetails.className"] = resolvedClassName;
        }
        if (Section) UpdateValue["grenralDetails.Section"] = Section;
        if (Subject) UpdateValue["grenralDetails.Subject"] = Subject;
        if (Topic) UpdateValue["grenralDetails.Topic"] = Topic;
        if (essentialAggrements) UpdateValue.essentialAggrements = essentialAggrements;
        if (planingAndPreparation) UpdateValue.planingAndPreparation = planingAndPreparation;
        if (classRoomEnvironment) UpdateValue.classRoomEnvironment = classRoomEnvironment;
        if (instruction) UpdateValue.instruction = instruction;
        if (totalScores) UpdateValue.totalScores = totalScores;
        if (scoreOutof) UpdateValue.scoreOutof = scoreOutof;
        if (percentageScore) UpdateValue.percentageScore = percentageScore;
        if (Grade) UpdateValue.Grade = Grade;
        if (NumberofParametersNotApplicable) UpdateValue.NumberofParametersNotApplicable = NumberofParametersNotApplicable;
        if (ObserverFeedback) {
            UpdateValue.ObserverFeedback = ObserverFeedback;
        }

        // Ensure isTeacherCompletes is set to false
        if (req.body.isDraft !== undefined) UpdateValue.isDraft = req.body.isDraft;
        if (req.body.currentStep !== undefined) UpdateValue.currentStep = req.body.currentStep;
        if (req.body.isObserverCompleted !== undefined) UpdateValue.isObserverCompleted = req.body.isObserverCompleted;

        // Update the form
        const existingForm = await Form2.findById(formId);
        const formDiff = calculateDiff(existingForm, UpdateValue);
        const updatedForm = await Form2.findByIdAndUpdate(formId, UpdateValue, {
            new: true,
        }).populate('grenralDetails.NameoftheVisitingTeacher', 'name email');

        recordAuditLog({
            req,
            action: 'UPDATE',
            module: 'Classroom Walkthrough',
            targetId: formId,
            details: `Updated Classroom Walkthrough form (ID: ${formId})`,
            changes: formDiff,
        });

        if (updatedForm?.grenralDetails?.className) {
            const resolved = await resolveClassNameFromInput(updatedForm.grenralDetails.className);
            if (resolved !== updatedForm.grenralDetails.className) {
                Form2.updateOne({ _id: formId }, { $set: { "grenralDetails.className": resolved } }).exec().catch(() => {});
                updatedForm.grenralDetails.className = resolved;
            }
        }

        // Notify the teacher ONLY on final completion (not on intermediate draft steps)
        const teacher = updatedForm?.grenralDetails?.NameoftheVisitingTeacher;
        const isFinalSubmit = req.body.isObserverCompleted === true && req.body.isDraft !== true;
        if (isFinalSubmit && teacher?.email) {
            const route = `classroom-walkthrough/create/${formId}`;
            const emailData = formCompletedEmail({
                recipientName: teacher.name,
                completorName: user.name,
                formTitle: "Classroom Walkthrough",
                formRoute: route,
                role: "Observer",
            });
            sendEmail(teacher.email, emailData.subject, emailData.html).catch(e =>
                console.error("Email error (editWalkthrouForm):", e)
            );
        }

        // Send a success response
        res.status(200).json({
            message: 'Form updated successfully!',
            success: true,
            updatedForm,
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.getSignleForm = async (req, res) => {
    const FormID = req?.params?.id;
    try {
        let Form = await Form2.findById(FormID)
            .populate({
                path: 'createdBy',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.NameoftheVisitingTeacher',
                select: '-password -mobile -employeeId -customId'
            })
            .lean();

        if (!FormID || !Form?._id) {
            return res.status(403).json({ message: "You do not have permission." });
        }

        await resolveSingleFormClassName(Form);

        res.status(200).send(Form);

    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
};

exports.GetTeahearsForm = async (req, res) => {
    const FormID = req?.params?.id;
    try {
        let Form = await Form2.find(FormID)
            .populate({
                path: 'createdBy',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.NameoftheVisitingTeacher',
                select: '-password -mobile -employeeId -customId'
            })
            .lean();

        if (!FormID && !Form?._id) {
            return res.status(403).json({ message: "You do not have permission." });
        }

        await resolveClassNames(Form);

        res.status(200).send(Form);

    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
};


exports.GetcreatedBy = async (req, res) => {
    const userId = req?.user?.id;
    if (!userId) {
        return res.status(403).json({ message: "You do not have permission." });
    }
    try {
        const result = await buildClassroomQueryAndPaginate(req, { createdBy: userId });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
};

exports.GetTeacherForm = async (req, res) => {
    const userId = req?.user?.id;
    if (!userId) {
        return res.status(403).json({ message: "You do not have permission." });
    }
    try {
        const result = await buildClassroomQueryAndPaginate(req, {
            "grenralDetails.NameoftheVisitingTeacher": userId,
        });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
};

exports.TeacherContinueForm = async (req, res) => {
    const userId = req?.user?.id;
    const FormID = req?.params?.id;
    const { TeacherFeedback, isTeacherCompletes } = req.body;

    try {
        // Fetch user details without sensitive fields
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        // Check if user has permission
        const isTeacherOrAdmin = user && (user.access === "Teacher" || user.isDualRole || user.access === "SuperAdmin" || user.access === "Superadmin");
        if (!isTeacherOrAdmin) {
            return res.status(403).json({ message: "You do not have permission to update this form." });
        }
        // Find the form
        // const form = await Form2.findById(FormID);
        const form = await Form2.findById(FormID).populate('createdBy', 'email name').populate('grenralDetails.NameoftheVisitingTeacher',"email name");


        if (!form) {
            return res.status(404).json({ message: "Form not found." });
        }

        // Update the form fields via findByIdAndUpdate to prevent Mongoose VersionError
        const updateFields = {};
        if (TeacherFeedback !== undefined) updateFields.TeacherFeedback = TeacherFeedback;
        if (isTeacherCompletes !== undefined) updateFields.isTeacherCompletes = isTeacherCompletes;

        const updatedForm = await Form2.findByIdAndUpdate(FormID, { $set: updateFields }, { new: true });

        const route = `classroom-walkthrough/create/${FormID}`;
        if (form.createdBy?.email) {
          const emailData = formCompletedEmail({
            recipientName: form.createdBy?.name || "Coordinator",
            completorName: form?.grenralDetails?.NameoftheVisitingTeacher?.name || user?.name || "Teacher",
            formTitle: "Classroom Walkthrough",
            formRoute: route,
            role: "Teacher",
          });
          sendEmail(form.createdBy.email, emailData.subject, emailData.html).catch(e => console.error("Email error in TeacherContinueForm:", e));
        }

        // Send the response
        res.status(200).json({ message: "Form Successfully Completed.", form: updatedForm });

    } catch (error) {
        console.error("Error in TeacherContinueForm:", error);
        res.status(500).json({ message: "An error occurred while updating the form.", error });
    }
};

exports.getClassRoomForms = async (req, res) => {
    const userId = req?.user?.id;
    if (!userId) {
        return res.status(403).json({ message: "You do not have permission." });
    }
    try {
        const result = await buildClassroomQueryAndPaginate(req, {});
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ error: error, message: "somthing went wrong" });
    }
};


// exports.ReminderFormTwo = async (req, res) => {
//     try {
//       const userId = req?.user?.id;
//       const formId = req?.params?.id;
  
//       const [UserDetails, FormDetails] = await Promise.all([
//         User.findById(userId),
//         Form2.findById(formId).populate({
//           path: 'teacherID',
//           select: '-password -mobile -employeeId -customId'
//       })
//       .populate({
//           path: 'createdBy',
//           select: '-password -mobile -employeeId -customId'
//       })
//       .populate({
//         path: `grenralDetails.NameoftheVisitingTeacher`,
//         select: '-password -mobile -employeeId -customId'
//     }),
//       ]);
  
//       if (!FormDetails) {
//         return res.status(400).json({ message: "Form not found" });
//       }
  
//       const accessRole = UserDetails?.access;
//       if (!["Observer", "Teacher"].includes(accessRole)) {
//         return res.status(403).json({ message: "Unauthorized access" });
//       }
  
//       const isObserver = accessRole === "Observer";
//       const sender = isObserver ? FormDetails?.grenralDetails?.NameoftheVisitingTeacher?.name || FormDetails?.createdBy?.name 
//                                 : FormDetails?.teacherID?.name || FormDetails?.userId?.name;
//       const receiverName = isObserver ? FormDetails?.teacherID?.name || FormDetails?.userId?.name
//                                       : FormDetails?.grenralDetails?.NameoftheVisitingTeacher?.name || FormDetails?.createdBy?.name;
//       const receiverEmail = isObserver ? FormDetails?.teacherID?.email || FormDetails?.userId?.email
//                                        : FormDetails?.grenralDetails?.NameoftheVisitingTeacher?.email || FormDetails?.createdBy?.email;
  
  
//       const subject = "Reminder: Classroom Walkthrough Proforma Submission Pending";
//       const body = `
//   Dear ${receiverName},
//   This is a reminder from ${sender} to review and fill out your section of the Classroom Walkthrough Proforma as soon as possible.
//   Regards,  
//   The Admin Team`;
  
//       await sendEmail(receiverEmail, subject, body);
//       return res.status(200).json({ success: true });
  
//     } catch (error) {
//       console.error("Error sending reminder:", error);
//       return res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
//   };


exports.ReminderFormTwo = async (req, res) => {
    try {
        const userId = req?.user?.id;
        const formId = req?.params?.id;

        const [UserDetails, FormDetails] = await Promise.all([
            User.findById(userId),
            Form2.findById(formId)
                .populate({
                    path: 'teacherID',
                    select: '-password -mobile -employeeId -customId'
                })
                .populate({
                    path: 'createdBy',
                    select: '-password -mobile -employeeId -customId'
                })
                .populate({
                    path: 'grenralDetails.NameoftheVisitingTeacher',
                    select: '-password -mobile -employeeId -customId'
                })
        ]);

        if (!FormDetails) {
            return res.status(400).json({ message: "Form not found" });
        }

        const accessRole = UserDetails?.access;
        if (!["Observer", "Teacher"].includes(accessRole)) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const isObserver = accessRole === "Teacher"; 
        const sender = isObserver 
            ? FormDetails?.grenralDetails?.NameoftheVisitingTeacher?.name || FormDetails?.createdBy?.name 
            : FormDetails?.teacherID?.name || FormDetails?.createdBy?.name;

        const receiverName = isObserver 
            ? FormDetails?.teacherID?.name || FormDetails?.createdBy?.name
            : FormDetails?.grenralDetails?.NameoftheVisitingTeacher?.name || FormDetails?.createdBy?.name;

        let receiverEmail = isObserver 
            ? FormDetails?.teacherID?.email || FormDetails?.createdBy?.email
            : FormDetails?.grenralDetails?.NameoftheVisitingTeacher?.email || FormDetails?.createdBy?.email;

        if (!receiverEmail) {
            return res.status(400).json({ message: "Recipient email not found" });
        }

        const route = `classroom-walkthrough/create/${FormDetails?._id}`;
        const emailData = reminderEmail({
          recipientName: receiverName,
          senderName: sender,
          formTitle: "Classroom Walkthrough",
          formRoute: route,
        });
        await sendEmail(receiverEmail, emailData.subject, emailData.html);

        recordAuditLog({
            req,
            action: 'REMINDER',
            module: 'Classroom Walkthrough',
            targetId: String(FormDetails?._id),
            details: `Sent reminder to ${receiverName} (${receiverEmail}) from ${sender}`,
            changes: [
                { field: 'receiverEmail', oldValue: null, newValue: receiverEmail },
                { field: 'formRoute', oldValue: null, newValue: route },
            ],
        });

        return res.status(200).json({ success: true, message: "Reminder sent successfully." });

    } catch (error) {
        console.error("Error sending reminder:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteFormTwo = async (req, res) => {
    const formId = req.params.id;
    try {
        const deletedForm = await Form2.findByIdAndDelete(formId);
        if (!deletedForm) {
            return res.status(404).json({ message: "Form not found." });
        }
        recordAuditLog({
            req,
            action: 'DELETE',
            module: 'Classroom Walkthrough',
            targetId: formId,
            details: `Deleted Classroom Walkthrough form (ID: ${formId})`,
        });
        res.status(200).json({ message: "Form deleted successfully.", success: true });
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({ message: "Error deleting form.", error: error.message });
    }
};
