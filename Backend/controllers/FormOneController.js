const User = require("../models/User"); // Import the User model (for Coordinators, Teachers, and Observers)
const sendEmail = require("../utils/emailService");
const Form1 = require("../models/Form1");
const Notification = require("../models/notification");
const ClassDetails = require("../models/ClassDetails");
const activity = require("../models/Activity");

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
      const coordinator = await User.findById({ _id: coordinatorID });
      if (coordinator?.email) {
        recipientEmail = coordinator.email;
        reciverId = coordinator._id;
      }

      const classData = await ClassDetails.findOne({ _id: className });
      if (!classData) {
        res
          .status(400)
          .json({ success: false, message: " Class and Section is Required!" });
      }

      formData = new Form1({
        userId,
        className: classData.className,
        section,
        date: new Date(date),
        isCoordinator,
        coordinatorID,
        isTeacher,
        observerForm: {}, // Defaults will apply
        teacherForm: {}, // Defaults will apply
      });
    } else if (isTeacher && teacherID) {
      const teacher = await User.findById({ _id: teacherID });
      if (teacher?.email) {
        recipientEmail = teacher.email;
        reciverId = teacher._id;
      }

      formData = new Form1({
        userId,
        className: className,
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

    const tactivity = new activity({
      userId: userId,
      title: "Fortnightly Monitor",
      className: formData.className,
      section: section,
      userName: req.user.name,
      form1: {
        message: `A new Fortnightly Monitor form has been created by ${req.user.name}`,
        router: `/fortnightly-monitor/create/${formData._id}`,
      },
    });
    await tactivity.save();

    // Send email and notification if recipient exists
    if (recipientEmail) {
      //       const subject = 'New Fortnightly Monitor Form Created';
      //       const body = `
      // Dear {Teacher Name},
      // The Fortnightly Monitor form has been initiated by {Observer Name} on {Date}. Kindly review and complete your section at your earliest convenience.
      // Regards,
      // The Admin Team
      //   `;
      //       await sendEmail(recipientEmail, subject, body);

      const notifications = new Notification({
        title: "You are invited to fill the Fortnightly Monitor Form",
        route: `fortnightly-monitor/create/${formData._id}`,
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
    const mongoose = require("mongoose");
    let finalClassName = className;
    if (className && mongoose.Types.ObjectId.isValid(className)) {
      const classData = await ClassDetails.findById(className);
      if (classData) finalClassName = classData.className;
    }

    if (isTeacher && Array.isArray(teacherIDs) && teacherIDs.length > 0) {
      const teacherForms = await Promise.all(
        teacherIDs.map(async (item) => {
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
      const recipientName = checkForm?.teacherID?.name;
      const subject = "Fortnightly Monitor Form Initiated";
      const body = `
Dear ${recipientName},
The Fortnightly Monitor form has been initiated by ${
        checkForm?.coordinatorID?.name || checkForm?.userId?.name
      } on ${new Date()}. Kindly review and complete your section at your earliest convenience.
Regards,
The Admin Team
  `;

      await sendEmail(recipientEmail, subject, body);

      if (validForms.length > 0) {
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

exports.getuserForm = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    
    // Fetch both sets of data
    const data = await Form1.find({ userId, ...queryFilter });
    const Form = await Form1.find({ teacherID: userId, ...queryFilter }).populate(
      "teacherID coordinatorID",
    );

    // Combine both arrays without duplicates based on _id
    const combinedArray = [
      ...data,
      ...Form.filter(
        (formItem) =>
          !data.some(
            (dataItem) => dataItem._id.toString() === formItem._id.toString(),
          ),
      ),
    ];

    res.status(200).send({ CombinedForm: combinedArray });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.GetObseverForm1 = async (req, res) => {
  const userId = req?.user?.id;
  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    const Form = await Form1.find({ coordinatorID: userId, ...queryFilter })
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
    const FormInitiation = await Form1.find({ isObserverInitiation: true, ...queryFilter })
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
    if (!userId && !userId?.id) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    res.status(200).send({ Form: Form, Initiate: FormInitiation });
  } catch (error) {
    console.error("Error Getting Classroom Walkthrough:", error);
    res
      .status(500)
      .json({ message: "Error Getting Classroom Walkthrough.", error });
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

    const mongoose = require("mongoose");
    let FindClass = null;
    if (mongoose.Types.ObjectId.isValid(className)) {
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

    // Create an object to store the updates
    let updateData = {};

    if (isCoordinatorComplete) {
      updateData = {
        isCoordinatorComplete,
        ObserverSubmissionDate: new Date(),
        observerForm,
      };
    } else if (isTeacherComplete) {
      updateData = {
        isTeacherComplete,
        TeacherSubmissionDate: new Date(),
        teacherForm,
        className: FindClass?.className || className,
        date: data?.date || date,
        section: data?.section || Section,
      };
    }

    // Update the form based on the formId
    const updatedForm = await Form1.findByIdAndUpdate(formId, updateData, {
      new: true,
    }).populate("teacherID coordinatorID userId");

    // If no form was found, return a 404 error
    if (!updatedForm) {
      return res.status(404).json({
        message: "Form not found",
      });
    }
    const recipientEmail =
      updatedForm?.userId?.email || updatedForm?.userId?.email;
    const recipientName =
      updatedForm?.userId?.name || updatedForm?.userId?.name;

    if (updatedForm?.isCoordinatorComplete) {
      const subject = "Observer Submission Completed for Fortnightly Monitor";
      const body = ` 
      Dear ${updatedForm?.teacherID?.name || updatedForm?.userId?.name},
      ${
        updatedForm?.coordinatorID?.name || updatedForm?.userId?.name
      } has submitted their section of the Fortnightly Monitor form on ${new Date()}. You may review the Report now.
      Regards,
      The Admin Team
                    `;

      await sendEmail(
        updatedForm?.teacherID?.email || updatedForm?.userId?.email,
        subject,
        body,
      );
    }

    if (updatedForm?.isTeacherComplete) {
      const notifications = new Notification({
        title: `${updatedForm?.teacherID?.name} Have Complete the form now its your turn!`,
        route: `fortnightly-monitor/create/${updatedForm?._id}`,
        reciverId: updatedForm?.userId?._id,
        date: new Date(),
        status: "unSeen",
      });

      const subject =
        "Self-Assessment Submission Received for Fortnightly Monitor";
      const body = ` 
Dear ${updatedForm?.coordinatorID?.name || updatedForm?.userId?.name},
${
  updatedForm?.teacherID?.name || updatedForm?.userId?.name
} has submitted their Self-Assessment of the Fortnightly Monitor form on ${new Date()}. Please review and fill your section.
Regards,
The Admin Team
                          `;

      await sendEmail(
        updatedForm?.coordinatorID?.email || updatedForm?.userId?.email,
        subject,
        body,
      );
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

  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    const GetAllForms = await Form1.find(queryFilter)
      .sort({ createdAt: -1 })
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
    if (!userId && !userId?.id) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    res.status(200).send(GetAllForms);
  } catch (error) {
    console.error("Error Getting Form One:", error);
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

    const subject = "Reminder: Fortnightly Monitor Form Submission Pending";
    const body = `
Dear ${receiverName},
This is a gentle reminder from ${sender} to complete your section of the Fortnightly Monitor form at the earliest.

Regards,  
The Admin Team`;

    await sendEmail(receiverEmail, subject, body);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending reminder:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
