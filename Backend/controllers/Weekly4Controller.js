const mongoose = require("mongoose");
const { createNotification } = require("../config/notify");
const ClassDetails = require("../models/ClassDetails");
const User = require("../models/User");
const Weekly4Form = require("../models/Weekly4Form");
const sendEmail = require("../utils/emailService");
const { formInitiatedEmail, formCompletedEmail, reminderEmail } = require("../utils/emailTemplates");
const { recordAuditLog, calculateDiff } = require("../utils/auditLogger");

// Helper to strip non-hex characters (e.g. trailing period from copied links)
const cleanId = (id) => (id ? id.toString().trim().replace(/[^a-f\d]/gi, "") : "");

// Create a new Weekly4Form
exports.createWeekly4Form = async (req, res) => {
  const { id: userId } = req?.user || {};
  const {
    teacherId: teacherIds = [],
    FormData,
    date,
    dateOfSubmission,
    isCompleted,
    isInitiated,
    isDraft,
    currentStep,
  } = req.body;

  try {
    // Step 1: Validate user existence
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    // Step 2: Handle initiated forms directly
    if (isInitiated?.status) {
      const payload = { date, isInitiated };
      return handleInitiatedForms(teacherIds, payload, res, req);
    }

    // Step 3: Fetch class names for each classId in FormData
    const classNamesMap = await getClassNamesForFormData(FormData);

    // Step 4: Replace classId with className in FormData
    const updatedFormData = FormData?.map((formItem) => {
      if (formItem?.classId && Array.isArray(formItem.classId)) {
        return {
          ...formItem,
          classId: formItem.classId.map(
            (classId) => classNamesMap[classId] || null,
          ),
        };
      }
      return formItem;
    });

    // Step 5: Prepare the payload
    const isDraftSave = isDraft === true;
    const payload = {
      FormData: updatedFormData,
      date,
      dateOfSubmission,
      isCompleted: isDraftSave ? false : (isCompleted !== undefined ? isCompleted : true),
      isDraft: isDraftSave,
      currentStep: currentStep !== undefined ? currentStep : 0,
      isInitiated,
      teacherId: userId,
    };

    // Step 6: Process observers and create forms
    if (Array.isArray(payload?.isInitiated?.Observer) && payload.isInitiated.Observer.length) {
      for (const observer of payload.isInitiated.Observer) {
        const observerPayload = {
          ...payload,
          isInitiated: { ...payload.isInitiated, Observer: observer },
        };
        return createNonInitiatedForm(observerPayload, res, req);
      }
    } else {
      return createNonInitiatedForm(payload, res, req);
    }

    return res
      .status(200)
      .json({ success: true, message: "Form processed successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Helper function to get class names for FormData
const getClassNamesForFormData = async (FormData) => {
  const classNamesMap = {};

  // Ensure FormData exists and is an array
  if (!Array.isArray(FormData)) {
    return classNamesMap;
  }

  // Collect all classIds
  const classIds = FormData.filter(
    (formItem) => formItem?.sections && Array.isArray(formItem?.sections),
  ).flatMap((formItem) => formItem.sections.map((section) => section.classId)); // Safely access classId

  const uniqueClassIds = [...new Set(classIds)];

  // Fetch class details in bulk (only once)
  const classDetails = await ClassDetails.find({
    _id: { $in: uniqueClassIds },
  }).lean();

  // Map classIds to classNames
  classDetails.forEach((classDetail) => {
    classNamesMap[classDetail._id] = classDetail?.className;
  });

  // Replace classId with className in FormData
  FormData.forEach((formItem) => {
    if (formItem?.sections) {
      formItem.sections.forEach((section) => {
        const className = classNamesMap[section.classId];
        if (className) {
          section.className = className; // Replace classId with className
          delete section.classId; // Optionally, remove classId if no longer needed
        }
      });
    }
  });

  return FormData; // Return updated FormData with classNames
};

const handleInitiatedForms = async (rawTeacherIds, Payload, res, req) => {
  try {
    let rawId = Array.isArray(rawTeacherIds) ? rawTeacherIds[0] : rawTeacherIds;
    if (rawId && typeof rawId === "object") {
      rawId = rawId._id || rawId.value || rawId.id || null;
    }
    const cleanTeacherId = rawId ? String(rawId).trim() : "";

    if (!cleanTeacherId || !mongoose.Types.ObjectId.isValid(cleanTeacherId) || !/^[a-f\d]{24}$/i.test(cleanTeacherId)) {
      return res.status(400).json({ success: false, error: "Please select a valid teacher." });
    }

    if (Payload?.isInitiated?.Observer && cleanTeacherId === String(Payload.isInitiated.Observer)) {
      return res.status(400).json({ success: false, error: "You cannot initiate a form to yourself." });
    }

    const teachName = await User.findById(cleanTeacherId);
    if (!teachName) {
      return res.status(404).json({ success: false, error: "Selected teacher not found." });
    }

    let observerId = Payload?.isInitiated?.Observer || req?.user?.id;
    if (observerId && typeof observerId === "object") {
      observerId = observerId._id || observerId.id;
    }
    const cleanObserverId = observerId ? String(observerId).trim() : "";
    const ObserverName = (cleanObserverId && mongoose.Types.ObjectId.isValid(cleanObserverId))
      ? await User.findById(cleanObserverId)
      : null;

    const formPayload = {
      ...Payload,
      teacherId: teachName._id,
    };

    const newForm = new Weekly4Form(formPayload);
    const savedForm = await newForm.save();

    // Send email using the standard HTML template with a direct form link
    if (teachName?.email) {
      const route = `weekly4form/create/${savedForm._id}`;
      const emailData = formInitiatedEmail({
        recipientName: teachName.name,
        initiatorName: ObserverName?.name || "Observer",
        formTitle: "Learning Progress Checklist",
        formRoute: route,
      });
      try {
        await sendEmail(teachName.email, emailData.subject, emailData.html);
      } catch (e) {
        console.error("Failed to send initiate email:", e);
      }
    }

    if (req) {
      recordAuditLog({
        req,
        action: 'CREATE',
        module: 'Learning Progress',
        details: `Initiated Learning Progress Checklist for ${teachName.name}`,
      });
    }

    return res.status(201).json({ success: true, data: [savedForm] });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Helper function to handle non-initiated forms (single form)
const createNonInitiatedForm = async (Payload, res, req) => {
  try {
    const teacher = await User.findById(Payload?.teacherId);
    const UserName = await User.findById(Payload?.isInitiated?.Observer);
    if (!UserName) {
      return res.status(404).json({ success: false, message: "Observer Not Exist!" });
    }
    const newForm = new Weekly4Form(Payload);
    const savedForm = await newForm.save();

    recordAuditLog({
      req,
      action: 'CREATE',
      module: 'Learning Progress',
      targetId: savedForm._id,
      details: `Created Learning Progress Checklist for ${teacher?.name || 'Teacher'}`,
    });

    // Send HTML email to observer: teacher has submitted their section ONLY if not draft
    if (!Payload.isDraft && Payload.isCompleted && UserName?.email) {
      const route = `weekly4form/create/${savedForm._id}`;
      const emailData = formCompletedEmail({
        recipientName: UserName.name,
        completorName: teacher?.name || "Teacher",
        formTitle: "Learning Progress Checklist",
        formRoute: route,
        role: "Teacher",
      });
      await sendEmail(UserName.email, emailData.subject, emailData.html);
    }

    if (!savedForm)
      return res.status(400).json({ success: false, error: "Form not saved" });
    return res.status(201).json({ success: true, data: savedForm });
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    return res.status(400).json({ success: false, error: error.message });
  }
};


// ── Shared Helper for Server-Side Filtering, Pagination (limit/skip) & Count ───
const buildWeekly4QueryAndPaginate = async (req, baseCondition = {}) => {
  const queryFilter = { ...baseCondition };

  // 1. Session date filter
  if (req.sessionDateFilter) {
    queryFilter.createdAt = req.sessionDateFilter;
  }

  // 2. Submission date filter
  if (req.query.date || req.query.dateOfSubmission) {
    const d = new Date(req.query.date || req.query.dateOfSubmission);
    if (!isNaN(d.getTime())) {
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      queryFilter.dateOfSubmission = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
  }

  // 3. Completion filter
  if (
    req.query.isCompleted !== undefined &&
    req.query.isCompleted !== null &&
    req.query.isCompleted !== ""
  ) {
    queryFilter.isCompleted = String(req.query.isCompleted) === "true";
  }

  // 4. Person & Name search
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
      andConditions.push({ teacherId: { $in: matchedIds } });
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
          { coordinatorID: { $in: matchedIds } },
          { "isInitiated.Observer": { $in: matchedIds } },
          { userId: { $in: matchedIds } },
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
          { teacherId: { $in: matchedIds } },
          { coordinatorID: { $in: matchedIds } },
          { "isInitiated.Observer": { $in: matchedIds } },
          { userId: { $in: matchedIds } },
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

  // 5. Pagination params
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

  const totalCount = await Weekly4Form.countDocuments(queryFilter);

  // Parse sorting params
  const { parseSortParams } = require("../utils/sortHelper");
  const weekly4SortMap = {
    date: "date",
    dateOfSubmission: "dateOfSubmission",
    className: "className",
    section: "section",
    personName: "teacherId",
    teacherName: "teacherId",
    observerName: "coordinatorID",
    isCompleted: "isCompleted",
    createdAt: "createdAt",
  };
  const sortCriteria = parseSortParams(req.query, weekly4SortMap, { createdAt: -1 });

  let dbQuery = Weekly4Form.find(queryFilter)
    .sort(sortCriteria)
    .populate(
      "isInitiated.Observer",
      "-password -coordinator -designation -email -updatedAt -__v"
    )
    .populate(
      "teacherId",
      "-password -coordinator -designation -email -updatedAt"
    )
    .populate(
      "coordinatorID",
      "-password -coordinator -designation -email -updatedAt -__v"
    );

  if (!isAll && limit > 0) {
    dbQuery = dbQuery.skip(skip).limit(limit);
  }

  const forms = await dbQuery.lean();

  return {
    data: forms,
    pagination: {
      total: totalCount,
      page: isAll ? 1 : page,
      limit: isAll ? totalCount : limit,
      skip: isAll ? 0 : skip,
      totalPages: isAll ? 1 : Math.ceil(totalCount / (limit || 1)),
    },
    filterOptions: { classes: [], sections: [] },
  };
};

// Get all Weekly4Forms
exports.getAllWeekly4Forms = async (req, res) => {
  const userId = req.user.id;
  const activeRole = req.query.role || req.user?.activeRole || req.header('x-active-role') || req.user?.access;
  try {
    let roleQuery = {};
    if (activeRole === "Teacher") {
      roleQuery = { teacherId: userId };
    } else if (activeRole === "Observer") {
      roleQuery = { $or: [{ "isInitiated.Observer": userId }, { coordinatorID: userId }] };
    } else if (req.user?.access !== "Superadmin") {
      roleQuery = { $or: [{ teacherId: userId }, { "isInitiated.Observer": userId }, { coordinatorID: userId }] };
    }

    const result = await buildWeekly4QueryAndPaginate(req, roleQuery);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error in getAllWeekly4Forms:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single Weekly4Form by ID
exports.getWeekly4FormById = async (req, res) => {
  try {
    const formId = cleanId(req.params.id);
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }
    const form = await Weekly4Form.findById(formId)
      .populate("isInitiated.Observer", "name email access designation")
      .populate("teacherId", "name email access designation");
    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }
    res.status(200).json({ success: true, form });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ success: false, message: "Form not found" });
    }
    res
      .status(500)
      .json({
        success: false,
        message: "Form not found",
        error: error.message,
      });
  }
};

// Update a Weekly4Form by ID
// exports.updateWeekly4Form = async (req, res) => {
//   const { FormData, date, dateOfSubmission, isCompleted, isInitiated } = req.body;
//   try {

//     // Fetch class names for each classId in FormData
//     const ClassArry = await Promise.all(
//       FormData?.map(async (formItem) => {
//         if (formItem?.classId && Array.isArray(formItem.classId)) {
//           const classNames = await Promise.all(
//             formItem.classId.map(async (classId) => {
//               const classDetails = await ClassDetails.findById(classId);
//               return classDetails?.className || null;
//             })
//           );
//           return classNames; // Return the array of class names for this form item
//         }
//         return null;
//       })
//     );

//     // Replace classId with className in FormData
//     FormData?.forEach((formItem, index) => {
//       if (formItem.classId && Array.isArray(formItem.classId)) {
//         formItem.classId = ClassArry[index] || []; // Replace classId with the corresponding class names
//       }
//     });

//     const Payload = {
//       FormData,
//       date,
//       dateOfSubmission,
//       isCompleted,
//       isInitiated
//     }

//     const UserName = await User.findById(Payload?.isInitiated?.Observer);
//     const teacher = await User.findById(req.params.id);
//     if (!UserName) {
//       res.status(404).send({ message: "Observer Not Exist!" })
//     }

//     const updatedForm = await Weekly4Form.findByIdAndUpdate(
//       req.params.id,
//       Payload,
//       { new: true, runValidators: true }
//     ).populate('isInitiated.Observer', '-password -coordinator -designation -email -updatedAt -__v');

//     if (!updatedForm) {
//       return res.status(404).json({ message: 'Form not found' });
//     }

//     // Send email and create notification
//     const subject = 'Teacher Submission for Learning Progress Checklist';
//     const body = `
//      Dear ${UserName?.name},
//     ${teacher?.name} has submitted their section of the Learning Progress Checklist on ${new Date()}. Please review and take necessary action.
//     Regards,
//     The Admin Team
//      `;

//      await sendEmail(UserName.email, subject, body);

//     res.status(200).json(updatedForm);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.updateWeekly4Form = async (req, res) => {
  const { FormData, date, dateOfSubmission, isCompleted, isInitiated, isDraft, currentStep } =
    req.body;
  try {
    // Fetch class names for each classId in FormData
    const ClassArry = await Promise.all(
      FormData?.map(async (formItem) => {
        if (formItem?.classId && Array.isArray(formItem.classId)) {
          const classNames = await Promise.all(
            formItem.classId.map(async (classId) => {
              const classDetails = await ClassDetails.findById(classId);
              return classDetails?.className || null;
            }),
          );
          return classNames; // Return the array of class names for this form item
        }
        return null;
      }),
    );

    // Replace classId with className in FormData
    FormData?.forEach((formItem, index) => {
      if (formItem.classId && Array.isArray(formItem.classId)) {
        formItem.classId = ClassArry[index] || []; // Replace classId with the corresponding class names
      }
    });

    const isDraftSave = isDraft === true;
    const Payload = {
      FormData,
      date,
      dateOfSubmission,
      isCompleted: isDraftSave ? false : (isCompleted !== undefined ? isCompleted : true),
      isDraft: isDraftSave,
      isInitiated,
    };
    if (currentStep !== undefined) {
      Payload.currentStep = currentStep;
    }

    const formId = cleanId(req.params.id);
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(404).json({ message: "Form not found" });
    }

    const existingForm = await Weekly4Form.findById(formId);
    const formDiff = calculateDiff(existingForm, Payload);
    const updatedForm = await Weekly4Form.findByIdAndUpdate(
      formId,
      Payload,
      { new: true, runValidators: true },
    )
      .populate("isInitiated.Observer", "name email access designation")
      .populate("teacherId", "name email access designation");

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'Learning Progress',
      targetId: formId,
      details: `Updated Learning Progress Checklist (ID: ${formId})`,
      changes: formDiff,
    });

    // Send HTML email to the observer about the teacher's submission ONLY if not a draft
    if (!isDraftSave && Payload.isCompleted && updatedForm.isInitiated?.Observer?.email) {
      const route = `weekly4form/create/${formId}`;
      const emailData = formCompletedEmail({
        recipientName: updatedForm.isInitiated?.Observer?.name || "Observer",
        completorName: req.user?.name || "Teacher",
        formTitle: "Learning Progress Checklist",
        formRoute: route,
        role: "Teacher",
      });
      await sendEmail(updatedForm.isInitiated.Observer.email, emailData.subject, emailData.html);
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(400).json({ error: error.message });
  }
};

// Delete a Weekly4Form by ID
exports.deleteWeekly4Form = async (req, res) => {
  try {
    const formId = cleanId(req.params.id);
    if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(404).json({ message: "Form not found" });
    }
    const deletedForm = await Weekly4Form.findByIdAndDelete(formId);

    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    recordAuditLog({
      req,
      action: 'DELETE',
      module: 'Learning Progress',
      targetId: formId,
      details: `Deleted Learning Progress Checklist (ID: ${formId})`,
    });

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    if (error?.name === "CastError") {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all Weekly4Forms for Admin
exports.getAllweeklyForms = async (req, res) => {
  try {
    const result = await buildWeekly4QueryAndPaginate(req, {});
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Error in getAllweeklyForms:", error);
    res.status(500).json({ error: error.message });
  }
};

// exports.ReminderFormFour = async (req, res) => {
//   try {
//     const userId = req?.user?.id;
//     const formId = req?.params?.id;

//     const [UserDetails, FormDetails] = await Promise.all([
//       User.findById(userId),
//       Weekly4Form.findById(formId).populate({
//         path: 'teacherId',
//         select: '-password -mobile -employeeId -customId'
//     })
//     .populate({
//         path: 'userId',
//         select: '-password -mobile -employeeId -customId'
//     })
//     .populate({
//       path: 'coordinatorID',
//       select: '-password -mobile -employeeId -customId'
//   }),
//     ]);

//     if (!FormDetails) {
//       return res.status(400).json({ message: "Form not found" });
//     }

//     const accessRole = UserDetails?.access;
//     if (!["Observer", "Teacher"].includes(accessRole)) {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     const isObserver = accessRole === "Observer";
//     const sender = isObserver ? FormDetails?.coordinatorID?.name || FormDetails?.userId?.name
//                               : FormDetails?.teacherId?.name || FormDetails?.userId?.name;
//     const receiverName = isObserver ? FormDetails?.teacherId?.name || FormDetails?.userId?.name
//                                     : FormDetails?.coordinatorID?.name || FormDetails?.userId?.name;
//     const receiverEmail = isObserver ? FormDetails?.teacherId?.email || FormDetails?.userId?.email
//                                      : FormDetails?.coordinatorID?.email || FormDetails?.userId?.email;

//     const subject = "Reminder: Fortnightly Monitor Form Submission Pending";
//     const body = `
// Dear ${receiverName},
// This is a gentle reminder from ${sender} to complete your section of the Fortnightly Monitor form at the earliest.

// Regards,
// The Admin Team`;

//     await sendEmail(receiverEmail, subject, body);
//     return res.status(200).json({ success: true });

//   } catch (error) {
//     console.error("Error sending reminder:", error);
//     return res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

exports.ReminderFormFour = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const formId = req?.params?.id;

    const [UserDetails, FormDetails] = await Promise.all([
      User.findById(userId),
      Weekly4Form.findById(formId)
        .populate({
          path: "teacherId",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: "userId",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: "coordinatorID",
          select: "-password -mobile -employeeId -customId",
        })
        .populate({
          path: "isInitiated.Observer",
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

    // Define sender and receiver correctly
    let sender, receiverName, receiverEmail;

    if (accessRole === "Observer") {
      sender =
        FormDetails?.coordinatorID?.name ||
        FormDetails?.isInitiated?.Observer?.name;
      receiverName = FormDetails?.teacherId?.name || FormDetails?.userId?.name;
      receiverEmail =
        FormDetails?.teacherId?.email || FormDetails?.userId?.email;
    } else {
      sender = FormDetails?.teacherId?.name || FormDetails?.userId?.name;
      receiverName =
        FormDetails?.coordinatorID?.name || FormDetails?.userId?.name;
      receiverEmail =
        FormDetails?.coordinatorID?.email || FormDetails?.userId?.email;
    }

    // Check if receiverEmail exists before sending
    if (!receiverEmail) {
      console.error("❌ No valid receiver email found.");
      return res.status(400).json({ message: "Receiver email is missing" });
    }

    const route = `weekly4form/create/${FormDetails?._id}`;
    const emailData = reminderEmail({
      recipientName: receiverName,
      senderName: sender,
      formTitle: "Learning Progress Checklist",
      formRoute: route,
    });
    await sendEmail(receiverEmail, emailData.subject, emailData.html);

    recordAuditLog({
      req,
      action: 'REMINDER',
      module: 'Learning Progress Checklist',
      targetId: String(FormDetails?._id),
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
