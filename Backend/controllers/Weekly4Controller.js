const { createNotification } = require("../config/notify");
const ClassDetails = require("../models/ClassDetails");
const User = require("../models/User");
const Weekly4Form = require("../models/Weekly4Form");
const sendEmail = require("../utils/emailService");

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
      return handleInitiatedForms(teacherIds, payload, res);
    }

    // Step 3: Fetch class names for each classId in FormData
    const classNamesMap = await getClassNamesForFormData(FormData);

    // Step 4: Replace classId with className in FormData
    const updatedFormData = FormData.map((formItem) => {
      if (formItem?.classId && Array.isArray(formItem.classId)) {
        return {
          ...formItem,
          classId: formItem.classId.map((classId) => classNamesMap[classId] || null),
        };
      }
      return formItem;
    });

    // Step 5: Prepare the payload
    const payload = {
      FormData: updatedFormData,
      date,
      dateOfSubmission,
      isCompleted,
      isInitiated,
      teacherId: userId,
    };

    // Step 6: Process observers and create forms
    if (payload?.isInitiated?.Observer?.length) {
      for (const observer of payload.isInitiated.Observer) {
        const observerPayload = { ...payload, isInitiated: { ...payload.isInitiated, Observer: observer } };
        return createNonInitiatedForm(observerPayload, res);
      }
    } else {
      return createNonInitiatedForm(payload, res);
    }

    return res.status(200).json({ success: true, message: "Form processed successfully." });
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
  const classIds = FormData
    .filter(formItem => formItem?.sections && Array.isArray(formItem?.sections))
    .flatMap(formItem => formItem.sections.map(section => section.classId)); // Safely access classId

  const uniqueClassIds = [...new Set(classIds)];

  // Fetch class details in bulk (only once)
  const classDetails = await ClassDetails.find({ '_id': { $in: uniqueClassIds } }).lean();

  // Map classIds to classNames
  classDetails.forEach(classDetail => {
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

// Helper function to handle initiated forms (with multiple teacher IDs)
const handleInitiatedForms = async (teacherIds, Payload, res) => {
  try {

    const dataPush = await Promise.all(
      teacherIds.map(async (teacherId) => {
        Payload.teacherId = teacherId;
        const teachName = await User.findById(teacherId);
        const ObserverName = await User.findById(Payload?.isInitiated?.Observer);

        const newForm = new Weekly4Form(Payload);
        const savedForm = await newForm.save();


        // Send email and create notification
        const subject = 'Learning Progress Checklist Initiated';
        const body = `
Dear ${teachName?.name},
The Learning Progress Checklist has been initiated by ${ObserverName?.name} on ${new Date()}. Please fill out your section at your earliest convenience.
Regards,
The Admin Team
     `;
        await sendEmail(teachName.email, subject, body);

        if (!savedForm) throw new Error("Form not saved");
        return savedForm;
      })
    );
    return res.status(201).json({ success: true, data: dataPush });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Helper function to handle non-initiated forms (single form)
const createNonInitiatedForm = async (Payload, res) => {
  try {

    const teacher = await User.findById(Payload?.teacherId);
    const UserName = await User.findById(Payload?.isInitiated?.Observer);
    if (!UserName) {
      res.status(404).send({ message: "Observer Not Exist!" })
    }
    const newForm = new Weekly4Form(Payload);
    const savedForm = await newForm.save();

    // Send email and create notification
    const subject = 'Teacher Submission for Learning Progress Checklist';
    const body = `
     Dear ${UserName?.name},
    ${teacher?.name} has submitted their section of the Learning Progress Checklist on ${new Date()}. Please review and take necessary action.
    Regards,
    The Admin Team
     `;
    await sendEmail(UserName.email, subject, body);

    if (!savedForm) return res.status(400).json({ success: false, error: "Form not saved" });
    return res.status(201).json({ success: true, data: savedForm });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};


// Get all Weekly4Forms
exports.getAllWeekly4Forms = async (req, res) => {

  const userId = req.user.id
  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    // Fetch all Weekly4Forms
    const forms = await Weekly4Form.find({
      $or: [
        { teacherId: userId },
        { 'isInitiated.Observer': userId }
      ],
      ...queryFilter
    }).lean()
      .populate('isInitiated.Observer', '-password -coordinator -designation -email -updatedAt -__v')
      .populate('teacherId', '-password -coordinator -designation -email -updatedAt ');
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single Weekly4Form by ID
exports.getWeekly4FormById = async (req, res) => {
  try {
    const form = await Weekly4Form.findById(req.params.id).populate('isInitiated.Observer');
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }
    res.status(200).json({ success: true, form });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Form not found', error: error.message });
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
  const { FormData, date, dateOfSubmission, isCompleted, isInitiated } = req.body;
  try {
    // Fetch class names for each classId in FormData
    const ClassArry = await Promise.all(
      FormData?.map(async (formItem) => {
        if (formItem?.classId && Array.isArray(formItem.classId)) {
          const classNames = await Promise.all(
            formItem.classId.map(async (classId) => {
              const classDetails = await ClassDetails.findById(classId);
              return classDetails?.className || null;
            })
          );
          return classNames; // Return the array of class names for this form item
        }
        return null;
      })
    );

    // Replace classId with className in FormData
    FormData?.forEach((formItem, index) => {
      if (formItem.classId && Array.isArray(formItem.classId)) {
        formItem.classId = ClassArry[index] || []; // Replace classId with the corresponding class names
      }
    });

    const Payload = {
      FormData, 
      date,
      dateOfSubmission,
      isCompleted,
      isInitiated
    };

    const updatedForm = await Weekly4Form.findByIdAndUpdate(
      req.params.id,
      Payload,
      { new: true, runValidators: true }
    ).populate('isInitiated.Observer', 'name email');

    if (!updatedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Send email to the observer about the teacher's submission
    if (updatedForm.isInitiated?.Observer?.email) {
      const observerName = updatedForm.isInitiated?.Observer?.name;
      const teacherName = req.user?.name; // Assuming the teacher's name is from req.user
      const subject = 'Teacher Submission for Learning Progress Checklist';
      const body = `
Dear ${observerName},

${teacherName} has submitted their section of the Learning Progress Checklist on ${date}. Please review and take necessary action.

Regards,
The Admin Team
      `;
      await sendEmail(updatedForm.isInitiated.Observer.email, subject, body);
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete a Weekly4Form by ID
exports.deleteWeekly4Form = async (req, res) => {
  try {
    const deletedForm = await Weekly4Form.findByIdAndDelete(req.params.id);

    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a Weekly4Form 
exports.getAllweeklyForms = async (req, res) => {
  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    const getAllFrom = await Weekly4Form.find(queryFilter).populate(`isInitiated.Observer teacherId`,'-password -coordinator -designation -email -updatedAt -__v')

    if (!getAllFrom) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json(getAllFrom);
  } catch (error) {
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
        .populate({ path: 'teacherId', select: '-password -mobile -employeeId -customId' })
        .populate({ path: 'userId', select: '-password -mobile -employeeId -customId' })
        .populate({ path: 'coordinatorID', select: '-password -mobile -employeeId -customId' })
        .populate({ path: 'isInitiated.Observer', select: '-password -mobile -employeeId -customId' })

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
      sender = FormDetails?.coordinatorID?.name || FormDetails?.isInitiated?.Observer?.name;
      receiverName = FormDetails?.teacherId?.name || FormDetails?.userId?.name;
      receiverEmail = FormDetails?.teacherId?.email || FormDetails?.userId?.email;
    } else {
      sender = FormDetails?.teacherId?.name || FormDetails?.userId?.name;
      receiverName = FormDetails?.coordinatorID?.name || FormDetails?.userId?.name;
      receiverEmail = FormDetails?.coordinatorID?.email || FormDetails?.userId?.email;
    }

    // Check if receiverEmail exists before sending
    if (!receiverEmail) {
      console.error("❌ No valid receiver email found.");
      return res.status(400).json({ message: "Receiver email is missing" });
    }


    const subject = "Learning Progress Checklist Initiated";
    const body = `
Dear ${receiverName},
The Learning Progress Checklist has been initiated by ${sender} on ${new Date()}. Please fill out your section at your earliest convenience.
Regards,  
The Admin Team`;

    await sendEmail(receiverEmail, subject, body);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error sending reminder:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
