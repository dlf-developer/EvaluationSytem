const { createNotification } = require('../config/notify');
const ClassDetails = require('../models/ClassDetails');
const Form2 = require('../models/Form2');
const notification = require('../models/notification');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');


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

        // Check if the user has access as "Observer" or "SuperAdmin"
        if (!user || (user.access !== "Observer" && user.access !== "SuperAdmin")) {
            return res.status(403).json({ message: "You do not have permission to create this form." });
        }

        // Ensure that the NameoftheVisitingTeacher is provided
        if (!NameoftheVisitingTeacher) {
            return res.status(400).json({ message: "Name of the Visiting Teacher is required." });
        }


        const classData = await ClassDetails.findById(className);
        if (!classData) {
            res.status(400).json({ success: false, message: " Class and Section is Required!" })
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
                className: classData?.className,
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
        const notification = await createNotification({
            title: 'You are invited to fill the Classroom Walkthrough',
            route: `classroom-walkthrough/create/${savedForm._id}`,
            reciverId: NameoftheVisitingTeacher,
        });



        const recipientEmail = await User.findById(NameoftheVisitingTeacher);
        const subject = 'Classroom Walkthrough Submission Completed';
        const body = ` 
Dear ${recipientEmail.name},
${user.name} has completed and submitted the Classroom Walkthrough Proforma on ${new Date()}. Please review the feedback and submit your reflections within the next 3 days.
Regards,
The Admin Team
                            `;

        await sendEmail(recipientEmail.email, subject, body);

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

        // Check if the user has access as "Observer" or "SuperAdmin"
        if (!user || (user.access !== "Observer" && user.access !== "SuperAdmin")) {
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
        if (className) UpdateValue["grenralDetails.className"] = className;
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
        UpdateValue.isTeacherCompletes = false;

        // Update the form
        const updatedForm = await Form2.findByIdAndUpdate(formId, UpdateValue, {
            new: true,
        });

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
        const Form = await Form2.findById(FormID)
            .populate({
                path: 'createdBy',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.NameoftheVisitingTeacher',
                select: '-password -mobile -employeeId -customId'
            });

        if (!FormID && !Form?._id) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(Form)

    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
}

exports.GetTeahearsForm = async (req, res) => {
    const FormID = req?.params?.id;
    try {
        const Form = await Form2.find(FormID)
            .populate({
                path: 'createdBy',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.NameoftheVisitingTeacher',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.className',
            });

        if (!FormID && !Form?._id) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(Form)

    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
}


exports.GetcreatedBy = async (req, res) => {
    const userId = req?.user?.id;
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    try {
        const Form = await Form2.find({ createdBy: userId, ...queryFilter })
            .populate({
                path: 'createdBy',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.NameoftheVisitingTeacher',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.className',
            });

        if (!userId && !userId?.id) {
            return res.status(403).json({ message: "You do not have permission." });
        }

        res.status(200).send(Form)

    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
}


exports.GetTeacherForm = async (req, res) => {
    const userId = req?.user?.id;
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    try {
        const Form = await Form2.find({ "grenralDetails.NameoftheVisitingTeacher": userId, ...queryFilter })
            .populate({
                path: 'createdBy',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.NameoftheVisitingTeacher',
                select: '-password -mobile -employeeId -customId'
            })
            .populate({
                path: 'grenralDetails.className',
            });

        if (!userId && !userId?.id) {
            return res.status(403).json({ message: "You do not have permission." });
        }

        res.status(200).send(Form)

    } catch (error) {
        console.error("Error Getting Classroom Walkthrough:", error);
        res.status(500).json({ message: "Error Getting Classroom Walkthrough.", error });
    }
}

exports.TeacherContinueForm = async (req, res) => {
    const userId = req?.user?.id;
    const FormID = req?.params?.id;
    const { TeacherFeedback, isTeacherCompletes } = req.body;

    try {
        // Fetch user details without sensitive fields
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        // Check if user has permission
        if (!user || (user.access !== "Teacher" && user.access !== "SuperAdmin")) {
            return res.status(403).json({ message: "You do not have permission to update this form." });
        }
        // Find the form
        // const form = await Form2.findById(FormID);
        const form = await Form2.findById(FormID).populate('createdBy', 'email name').populate('grenralDetails.NameoftheVisitingTeacher',"email name");


        if (!form) {
            return res.status(404).json({ message: "Form not found." });
        }

        // Update the form fields
        form.TeacherFeedback = TeacherFeedback || form.TeacherFeedback;
        form.isTeacherCompletes = isTeacherCompletes ?? form.isTeacherCompletes;

        const recipientEmail = form.createdBy.email;
        const subject = 'Teacher Submission Received for Classroom Walkthrough';
        const body = ` 
Dear ${form.createdBy.name},
${form?.grenralDetails?.NameoftheVisitingTeacher?.name} has submitted their section of the Classroom Walkthrough Proforma on ${new Date()}. Please review and provide your feedback.
Regards,
The Admin Team
                    `;

        await sendEmail(recipientEmail, subject, body);
        // Save the updated form
        await form.save();

        // Send the response
        res.status(200).json({ message: "Form Successfully Completed." });

    } catch (error) {
        console.error("Error in TeacherContinueForm:", error);
        res.status(500).json({ message: "An error occurred while updating the form.", error });
    }
};

exports.getClassRoomForms = async (req, res) => {
    const userId = req?.user?.id;
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    try {
        const GetAllForms = await Form2.find(queryFilter)
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
        if (!userId) {
            return res.status(403).json({ message: "You do not have permission." });
        }

        res.status(200).send(GetAllForms)

    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error, message: "somthing went wrong" })
    }
}


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

        const subject = "Reminder: Classroom Walkthrough Proforma Submission Pending";
        const body = `
Dear ${receiverName},
This is a reminder from ${sender} to review and fill out your section of the Classroom Walkthrough Proforma as soon as possible.
Regards,  
The Admin Team`;

        await sendEmail(receiverEmail, subject, body);
        return res.status(200).json({ success: true, message: "Reminder sent successfully." });

    } catch (error) {
        console.error("Error sending reminder:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};






