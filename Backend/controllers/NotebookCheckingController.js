const { createNotification } = require("../config/notify");
const ClassDetails = require("../models/ClassDetails");
const Form3 = require("../models/Form3");
const notification = require("../models/notification");
const User = require("../models/User");
const sendEmail = require("../utils/emailService");

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
  } = req.body;

  const userId = req?.user?.id;
  try {
    const user = await User.findById(
      userId,
      "-password -mobile -employeeId -customId"
    );

    // Check if the user has access as "Observer" or "SuperAdmin"
    if (!user || (user.access !== "Teacher" && user.access !== "SuperAdmin")) {
      return res
        .status(403)
        .json({ message: "You do not have permission to create this form." });
    }

    // Ensure that the NameoftheVisitingTeacher is provided
    if (!NameofObserver) {
      return res.status(400).json({ message: "Name of Observer is required." });
    }

    const classData = await ClassDetails.findOne({ _id: className });
    if (!classData) {
      res
        .status(400)
        .json({ success: false, message: " Class and Section is Required!" });
    }

    const newForm = new Form3({
      grenralDetails: {
        NameofObserver,
        DateOfObservation,
        className: classData?.className,
        Section,
        Subject,
      },
      NotebooksTeacher: {
        ClassStrength,
        NotebooksSubmitted,
        Absentees,
        Defaulters,
      },
      createdBy: user?._id,
      isObserverComplete: false,
      ObserverForm: {},
      isTeacherComplete: true,
      TeacherForm: {
        maintenanceOfNotebooks,
        qualityOfOppurtunities,
        qualityOfTeacherFeedback,
        qualityOfLearner,
      },
    });

    const savedForm = await newForm.save();

    const notification = await createNotification({
      title: "You are invited to fill the Notebook Checking",
      route: `notebook-checking-proforma/create/${savedForm._id}`,
      reciverId: NameofObserver,
    });

    const recipientEmail = await User.findById(NameofObserver);
    const subject = "Notebook Checking Proforma Created";
    const body = ` 
Dear ${recipientEmail.name},
${
  user.name
} has submitted their Notebook Checking Proforma on ${new Date()}. Please review and proceed accordingly.
Regards,
The Admin Team
                            `;

    await sendEmail(recipientEmail.email, subject, body);

    // Send success response
    res
      .status(201)
      .json({
        message: "Form created successfully",
        form: savedForm,
        status: true,
      });
  } catch (Error) {
    console.log("Error", Error);
    res.status(500).send(Error);
  }
};
exports.createInitiate = async (req, res) => {
  const { isTeacher, teacherIDs } = req.body;
  const userId = req?.user?.id;

  try {
    if (isTeacher && Array.isArray(teacherIDs) && teacherIDs.length > 0) {
      const teacherForms = await Promise.all(
        teacherIDs.map(async (teacherId) => {
          const teacher = await User.findById(teacherId);

          if (!teacher?.email) return null;

          // Create and save the form
          const formData = await new Form3({
            isObserverInitiation: true,
            teacherID: teacher._id,
            grenralDetails: {
              NameofObserver: userId,
              DateOfObservation: new Date(),
            },
            TeacherForm: {},
            ObserverForm: {},
            TeacherForm: {},
          }).save();

          const recipientEmail = await User.findById(userId);
          const subject = "Notebook Checking Proforma Initiated";
          const body = ` 
Dear ${teacher.name},
The Notebook Checking Proforma has been initiated by ${
            recipientEmail?.name
          } on ${new Date()}. Kindly review and complete your section at your earliest.
Regards,
The Admin Team

                            `;

          await sendEmail(teacher.email, subject, body);

          // Create and save the notification
          await new notification({
            title: "You are invited to fill the Notbook Form Initiated",
            route: `notebook-checking-proforma/initiate/create/${formData._id}`,
            reciverId: teacher._id,
            date: new Date(),
            status: "unSeen",
          }).save();

          return formData;
        })
      );

      // Filter out null forms and send response
      const validForms = teacherForms.filter(Boolean);
      return res.status(200).json({  message: "Form created successfully", form: validForms,status:true});
    } else {
      return res.status(400).json({ error: "Invalid or missing data." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getSignleForm = async (req, res) => {
  const FormID = req?.params?.id;
  try {
    const Form = await Form3.findById(FormID)
      .populate({
        path: "createdBy",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "grenralDetails.NameofObserver",
        select: "-password -mobile -employeeId -customId",
      });

    if (!FormID && !Form?._id) {
      return res.status(403).json({ message: "You do not have permission." });
    }
    res.status(200).send(Form);
  } catch (error) {
    console.error("Error Getting NoteBook Checking:", error);
    res
      .status(500)
      .json({ message: "Error Getting NoteBook Checking.", error });
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
    const formId = req.params?.id; // Get form ID from URL parameters

    const {
        ClassStrength,
        NotebooksSubmitted,
        Absentees,
        Defaulters,
        observerFeedback,
        isObserverComplete,
        maintenanceOfNotebooks,
        qualityOfOppurtunities,
        qualityOfTeacherFeedback,
        qualityOfLearner,
    } = req.body;

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
      })

        if (!existingForm) {
            return res.status(404).json({ message: "Form not found." });
        }


        // Extract observer details
        const teacher = existingForm?.teacherID || existingForm?.createdBy; 


        // Build the payload dynamically to include only provided fields
        const payload = {
            NotebooksObserver: {
                ClassStrength,
                NotebooksSubmitted,
                Absentees,
                Defaulters,
            },
            isObserverComplete: true,
            ObserverForm: {
                maintenanceOfNotebooks,
                qualityOfOppurtunities,
                qualityOfTeacherFeedback,
                qualityOfLearner,
            },
            observerFeedback,
            isReflation: false,
        };

        // Remove undefined or null values from the payload
        Object.keys(payload).forEach(
            (key) => (payload[key] === undefined || payload[key] === null) && delete payload[key]
        );

        // Update the form directly
        const updatedForm = await Form3.findByIdAndUpdate(
            formId,
            { $set: payload },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedForm) {
            return res.status(404).json({ message: "Form not found after update." });
        }


        // Send email to teacher if they exist
        if (teacher?.email) {
            const subject = "Observer Submission for Notebook Checking Proforma";
            const body = `
Dear ${teacher.name},
   
${observer.name} has completed their section of the Notebook Checking Proforma on ${new Date().toLocaleString()}. Please review the updates.

Regards,
The Admin Team
            `;

            try {
                await sendEmail(teacher?.email, subject, body);
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }
        } else {
            console.warn("Teacher email not found. Skipping email sending.");
        }

        res.status(200).json({
            success: true,
            message: "Observer fields updated successfully.",
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
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    // Fetch forms where the user is the creator
    const Form = await Form3.find({ createdBy: userId, ...queryFilter })
      .populate({
        path: "createdBy",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "grenralDetails.NameofObserver",
        select: "-password -mobile -employeeId -customId",
      });

    // Fetch forms where the user is a teacher
    const Form2 = await Form3.find({ teacherID: userId, ...queryFilter })
      .populate({
        path: "createdBy teacherID",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "grenralDetails.NameofObserver",
        select: "-password -mobile -employeeId -customId",
      });

    // Merge arrays and remove duplicates based on _id
    const uniqueForms = Array.from(
      new Map([...Form, ...Form2].map((item) => [item._id.toString(), item])).values()
    );

    res.status(200).json(uniqueForms);
  } catch (error) {
    console.error("Error Getting NoteBook:", error);
    res.status(500).json({ message: "Error Getting NoteBook.", error });
  }
};

exports.GetObseverForm = async (req, res) => {
  const userId = req?.user?.id;

  try {
    // Validate userId first
    if (!userId) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    // Fetch Form data based on observer ID
    const Form = await Form3.find({ "grenralDetails.NameofObserver": userId, ...queryFilter })
      .populate({
        path: "createdBy teacherID",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "grenralDetails.NameofObserver",
        select: "-password -mobile -employeeId -customId",
      });

    // Fetch Form2 data based on observer initiation flag
    const Form2 = await Form3.find({
      "grenralDetails.NameofObserver": userId,
      isObserverInitiation: true,
      ...queryFilter,
    })
      .populate({
        path: "createdBy teacherID",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "grenralDetails.NameofObserver",
        select: "-password -mobile -employeeId -customId",
      });

    // Combine both Form and Form2 data
    const combinedForms = [...Form, ...Form2];

    // Remove duplicates based on a unique property (e.g., _id)
    const uniqueForms = combinedForms.filter(
      (form, index, self) =>
        index ===
        self.findIndex((f) => f._id.toString() === form._id.toString())
    );

    // Send combined data as response
    res.status(200).json(uniqueForms);
  } catch (error) {
    console.error("Error Getting Classroom Walkthrough:", error);
    res
      .status(500)
      .json({ message: "Error Getting Classroom Walkthrough.", error });
  }
};

const updatePayload = (existingForm, userId, changes) => {
  const rolePrefix =
    userId === "Observer" ? "NotebooksObserver" : "NotebooksTeacher";
  const rolePrefix2 = userId === "Observer" ? "ObserverForm" : "TeacherForm";

  const fieldMappings = {
    [`${rolePrefix}.ClassStrength`]: changes.ClassStrength,
    [`${rolePrefix}.NotebooksSubmitted`]: changes.NotebooksSubmitted,
    [`${rolePrefix}.Absentees`]: changes.Absentees,
    [`${rolePrefix}.Defaulters`]: changes.Defaulters,
    [`observerFeedback`]: changes.observerFeedback,
    [`${rolePrefix2}`]: changes.isObserverComplete,
    [`${rolePrefix2}.maintenanceOfNotebooks`]: changes.maintenanceOfNotebooks,
    [`${rolePrefix2}.qualityOfOppurtunities`]: changes.qualityOfOppurtunities,
    [`${rolePrefix2}.qualityOfTeacherFeedback`]:
      changes.qualityOfTeacherFeedback,
    [`${rolePrefix2}.qualityOfLearner`]: changes.qualityOfLearner,
    [`isTeacherComplete`]: changes.isTeacherComplete,
    [`grenralDetails.className`]: changes.className,
    [`grenralDetails.Section`]: changes.Section,
    [`grenralDetails.Subject`]: changes.Subject,
  };

  const payload = {};

  for (const [key, currentValue] of Object.entries(fieldMappings)) {
    if (currentValue !== undefined) {
      const existingValue = key
        .split(".")
        .reduce((acc, part) => acc?.[part], existingForm);
      const hasChanged =
        typeof currentValue === "object"
          ? JSON.stringify(currentValue) !== JSON.stringify(existingValue)
          : currentValue !== existingValue;

      if (hasChanged) {
        payload[key] = currentValue;
      }
    }
  }

  return payload;
};

// exports.EditUpdateNotebook = async (req, res) => {
//     const formId = req.params.id;
//     const userId = req?.user?.access;

//     if (!formId) {
//         return res.status(400).json({ message: "Form ID is required" });
//     }

//     try {

//         const classNameFind = await ClassDetails.findById(req.body.className);

//         if (!req.body.className && !classNameFind) {
//             res.status(400).json({ message: "Not Found" })
//         }

//         const changes = {
//             ClassStrength: req.body.ClassStrength,
//             NotebooksSubmitted: req.body.NotebooksSubmitted,
//             Absentees: req.body.Absentees,
//             Defaulters: req.body.Defaulters,
//             observerFeedback: req.body.observerFeedback,
//             isObserverComplete: req.body.isObserverComplete,
//             maintenanceOfNotebooks: req.body.maintenanceOfNotebooks,
//             qualityOfOppurtunities: req.body.qualityOfOppurtunities,
//             qualityOfTeacherFeedback: req.body.qualityOfTeacherFeedback,
//             qualityOfLearner: req.body.qualityOfLearner,
//             isTeacherComplete: req.body.isTeacherComplete,
//             className: classNameFind?.className,
//             Subject: req.body.Subject,
//             Section: req.body.Section
//         };

//         const existingForm = await Form3.findById(formId);

//         if (!existingForm) {
//             return res.status(404).json({ message: "Form not found", success: false });
//         }

//         const payload = updatePayload(existingForm, userId, changes);

//         const updatedForm = await Form3.findByIdAndUpdate(formId, { $set: payload }, { new: true });

//         res.status(200).json({
//             message: "Form updated successfully!",
//             success: true,
//             updatedForm,
//         });
//     } catch (error) {
//         console.error("Error updating form:", error);
//         res.status(500).json({
//             message: "Error updating the form.",
//             error: error.message,
//         });
//     }
// };

exports.EditUpdateNotebook = async (req, res) => {
    const formId = req.params.id;
    const userId = req?.user?.access;

    if (!formId) {
        return res.status(400).json({ message: "Form ID is required" });
    }

    try {
        let classNameFind = null;
        if (req.body.className) {
            classNameFind = await ClassDetails.findById(req.body.className);
            if (!classNameFind) {
                return res.status(400).json({ message: "Class not found" });
            }
        }

        const changes = {
            ClassStrength: req.body.ClassStrength,
            NotebooksSubmitted: req.body.NotebooksSubmitted,
            Absentees: req.body.Absentees,
            Defaulters: req.body.Defaulters,
            observerFeedback: req.body.observerFeedback,
            isObserverComplete: req.body.isObserverComplete,
            maintenanceOfNotebooks: req.body.maintenanceOfNotebooks,
            qualityOfOppurtunities: req.body.qualityOfOppurtunities,
            qualityOfTeacherFeedback: req.body.qualityOfTeacherFeedback,
            qualityOfLearner: req.body.qualityOfLearner,
            isTeacherComplete: req.body.isTeacherComplete,
            className: classNameFind ? classNameFind.className : undefined,
            Subject: req.body.Subject,
            Section: req.body.Section,
        };

        const existingForm = await Form3.findById(formId).populate('grenralDetails.NameofObserver')
        if (!existingForm) {
            return res.status(404).json({ message: "Form not found", success: false });
        }

        const payload = updatePayload(existingForm, userId, changes);
        const updatedForm = await Form3.findByIdAndUpdate(
            formId,
            { $set: payload },
            { new: true }
        );

        if (!updatedForm) {
            return res.status(500).json({ message: "Error updating the form." });
        }

        res.status(200).json({
            message: "Form updated successfully!",
            success: true,
            updatedForm,
        });

        // Send email if the teacher completes the form
        if (req.body.isTeacherComplete) {
            const observerEmail = existingForm?.grenralDetails?.NameofObserver?.email;
            const teacherName = req?.user?.name;       
            if (observerEmail && teacherName) {
                const subject = "Notebook Checking Proforma Updated";
                const text = `
Dear Observer,

${teacherName} has completed their section of the Notebook Checking Proforma on ${new Date().toLocaleString()}. Please review and provide your feedback.

Regards,
The Admin Team
                `;

                sendEmail(observerEmail, subject, text).catch(err => {
                    console.error("Error sending email:", err);
                });
            }
        }
    } catch (error) {
        console.error("Error updating form:", error);
        res.status(500).json({
            message: "Error updating the form.",
            error: error.message,
        });
    }
};

exports.GetNootbookForms = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    const GetAllForms = await Form3.find(queryFilter)
      .populate({
        path: "teacherID",
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: `grenralDetails.NameofObserver`,
        select: "-password -mobile -employeeId -customId",
      })
      .populate({
        path: "createdBy",
        select: "-password -mobile -employeeId -customId",
      });
    if (!userId && !userId?.id) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    res.status(200).send(GetAllForms);
  } catch (error) {
    console.error("Error Getting Form One:", error);
    res.status(500).json({ message: "Error Getting Form One.", error });
  }
};



exports.updateTeacherReflationFeedback = async (req, res) => {
  const { id } = req.params;
  const { reflation } = req.body;


  try {
    // Find the existing form details
    const form = await Form3.findById(id).populate("createdBy"); // Fetch creator details

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Update the form with the teacher's reflection
    const updatedForm = await Form3.findByIdAndUpdate(
      id,
      {
        teacherReflationFeedback: reflation,
        isReflation: reflation ? true : false,
      },
      { new: true }
    );

    // Fetch Observer's Details
    const observer = await User.findById(form.grenralDetails.NameofObserver);
    const teacher = form.createdBy; // Teacher who submitted the form

    if (!observer) {
      return res.status(404).json({ message: "Observer not found" });
    }

    // Email Subject & Body
    const subject = "Notebook Checking Proforma Teacher Reflection Submitted";
    const body = ` 
Dear ${observer.name},

${teacher.name} has submitted their reflections of Notebook Checking Proforma on ${new Date().toLocaleDateString()}. Please review and proceed accordingly.

Regards,  
The Admin Team
    `;

    // Send Email to Observer
    await sendEmail(observer.email, subject, body);

    res.status(200).json({ success: true, message: "Reflection updated & email sent to observer", form: updatedForm});

  } catch (error) {
    console.error("Error updating teacher reflection feedback:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};


exports.ReminderFormThree = async (req, res) => {
  try {
    const userId = req?.user?.id;
    const formId = req?.params?.id;

    if (!userId || !formId) {
      return res.status(400).json({ message: "User ID or Form ID is missing" });
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

    const subject = "Reminder: Notebook Checking Proforma Submission Pending";
    const body = `
Dear ${receiverName},

This is a reminder from ${sender} to complete your section of the Notebook Checking Proforma.

The Admin Team`;

    await sendEmail(receiverEmail, subject, body);

    return res.status(200).json({ success: true, message: "Reminder sent successfully." });

  } catch (error) {
    console.error("Error sending reminder:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



