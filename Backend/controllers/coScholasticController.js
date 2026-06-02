const { createNotification } = require('../config/notify');
const ClassDetails = require('../models/ClassDetails');
const CoScholastic = require('../models/CoScholastic');
const notification = require('../models/notification');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const { formInitiatedEmail, formCompletedEmail, reminderEmail } = require('../utils/emailTemplates');

exports.createForm = async (req, res) => {
    const {
        NameoftheVisitingTeacher,
        DateOfObservation,
        className,
        Section,
        Subject,
        Topic,
        classroomManagement,
        planningAndExecution,
        studentEngagement,
        instructionAndFacilitation,
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
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        if (!user || (user.access !== "Observer" && user.access !== "SuperAdmin")) {
            return res.status(403).json({ message: "You do not have permission to create this form." });
        }

        if (!NameoftheVisitingTeacher) {
            return res.status(400).json({ message: "Name of the Visiting Teacher is required." });
        }

        const classData = await ClassDetails.findById(className);
        if (!classData) {
            res.status(400).json({ success: false, message: "Class and Section is Required!" })
        }

        const newForm = new CoScholastic({
            createdBy: userId,
            isObserverCompleted: ObserverFeedback ? true : false,
            ObserverFeedback: ObserverFeedback || [],
            isTeacherCompletes: false,
            grenralDetails: {
                NameoftheVisitingTeacher,
                DateOfObservation: DateOfObservation || new Date(),
                className: classData?.className,
                Section,
                Subject,
                Topic,
            },
            classroomManagement,
            planningAndExecution,
            studentEngagement,
            instructionAndFacilitation,
            totalScores,
            scoreOutof,
            percentageScore,
            Grade,
            NumberofParametersNotApplicable,
        });

        const savedForm = await newForm.save();
        
        await createNotification({
            title: 'You are invited to fill the Co-Scholastic Classroom Observation',
            route: `co-scholastic/create/${savedForm._id}`,
            reciverId: NameoftheVisitingTeacher,
        });

        const recipientUser = await User.findById(NameoftheVisitingTeacher);
        const route = `co-scholastic/create/${savedForm._id}`;
        const emailData = formInitiatedEmail({
          recipientName: recipientUser?.name,
          initiatorName: user.name,
          formTitle: "Co-Scholastic Classroom Observation",
          formRoute: route,
          className: classData?.className,
          section: Section,
          subject: Subject,
        });
        await sendEmail(recipientUser.email, emailData.subject, emailData.html);

        res.status(201).json({ message: "Form created successfully", form: savedForm, status: true });
    } catch (error) {
        console.error("Error creating Co-Scholastic Form:", error);
        res.status(500).json({ message: "Error creating Co-Scholastic Form.", status: false, error });
    }
};

exports.editCoScholasticForm = async (req, res) => {
    const {
        NameoftheVisitingTeacher,
        DateOfObservation,
        className,
        Section,
        Subject,
        Topic,
        classroomManagement,
        planningAndExecution,
        studentEngagement,
        instructionAndFacilitation,
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
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        if (!user || (user.access !== "Observer" && user.access !== "SuperAdmin")) {
            return res.status(403).json({ message: "You do not have permission to edit this form." });
        }

        const form = await CoScholastic.findById(formId);
        if (!form) {
            return res.status(404).json({ message: "Form does not exist." });
        }

        const UpdateValue = {};

        if (NameoftheVisitingTeacher) UpdateValue["grenralDetails.NameoftheVisitingTeacher"] = NameoftheVisitingTeacher;
        if (DateOfObservation) UpdateValue["grenralDetails.DateOfObservation"] = DateOfObservation;
        if (className) UpdateValue["grenralDetails.className"] = className;
        if (Section) UpdateValue["grenralDetails.Section"] = Section;
        if (Subject) UpdateValue["grenralDetails.Subject"] = Subject;
        if (Topic) UpdateValue["grenralDetails.Topic"] = Topic;
        if (classroomManagement) UpdateValue.classroomManagement = classroomManagement;
        if (planningAndExecution) UpdateValue.planningAndExecution = planningAndExecution;
        if (studentEngagement) UpdateValue.studentEngagement = studentEngagement;
        if (instructionAndFacilitation) UpdateValue.instructionAndFacilitation = instructionAndFacilitation;
        if (totalScores) UpdateValue.totalScores = totalScores;
        if (scoreOutof) UpdateValue.scoreOutof = scoreOutof;
        if (percentageScore) UpdateValue.percentageScore = percentageScore;
        if (Grade) UpdateValue.Grade = Grade;
        if (NumberofParametersNotApplicable) UpdateValue.NumberofParametersNotApplicable = NumberofParametersNotApplicable;
        if (ObserverFeedback) {
            UpdateValue.ObserverFeedback = ObserverFeedback;
        }

        UpdateValue.isTeacherCompletes = false;

        const updatedForm = await CoScholastic.findByIdAndUpdate(formId, UpdateValue, { new: true });

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
        const Form = await CoScholastic.findById(FormID)
            .populate({ path: 'createdBy', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId -customId' });

        if (!FormID && !Form?._id) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(Form)
    } catch (error) {
        res.status(500).json({ message: "Error Getting Form.", error });
    }
}

exports.GetTeahearsForm = async (req, res) => {
    const FormID = req?.params?.id;
    try {
        const Form = await CoScholastic.find(FormID)
            .populate({ path: 'createdBy', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.className' });

        if (!FormID && !Form?._id) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(Form)
    } catch (error) {
        res.status(500).json({ message: "Error Getting Form.", error });
    }
}

exports.GetcreatedBy = async (req, res) => {
    const userId = req?.user?.id;
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    try {
        const Form = await CoScholastic.find({ createdBy: userId, ...queryFilter })
            .sort({ createdAt: -1 })
            .populate({ path: 'createdBy', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.className' });

        if (!userId && !userId?.id) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(Form)
    } catch (error) {
        res.status(500).json({ message: "Error Getting Form.", error });
    }
}

exports.GetTeacherForm = async (req, res) => {
    const userId = req?.user?.id;
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    try {
        const Form = await CoScholastic.find({ "grenralDetails.NameoftheVisitingTeacher": userId, ...queryFilter })
            .sort({ createdAt: -1 })
            .populate({ path: 'createdBy', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.className' });

        if (!userId && !userId?.id) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(Form)
    } catch (error) {
        res.status(500).json({ message: "Error Getting Form.", error });
    }
}

exports.TeacherContinueForm = async (req, res) => {
    const userId = req?.user?.id;
    const FormID = req?.params?.id;
    const { TeacherFeedback, isTeacherCompletes } = req.body;

    try {
        const user = await User.findById(userId, "-password -mobile -employeeId -customId");

        if (!user || (user.access !== "Teacher" && user.access !== "SuperAdmin")) {
            return res.status(403).json({ message: "You do not have permission to update this form." });
        }

        const form = await CoScholastic.findById(FormID)
            .populate('createdBy', 'email name')
            .populate('grenralDetails.NameoftheVisitingTeacher', "email name");

        if (!form) {
            return res.status(404).json({ message: "Form not found." });
        }

        form.TeacherFeedback = TeacherFeedback || form.TeacherFeedback;
        form.isTeacherCompletes = isTeacherCompletes ?? form.isTeacherCompletes;

        const route = `co-scholastic/create/${FormID}`;
        const emailData = formCompletedEmail({
          recipientName: form.createdBy.name,
          completorName: form?.grenralDetails?.NameoftheVisitingTeacher?.name,
          formTitle: "Co-Scholastic Classroom Observation",
          formRoute: route,
          role: "Teacher",
        });
        await sendEmail(form.createdBy.email, emailData.subject, emailData.html);
        
        await form.save();
        res.status(200).json({ message: "Form Successfully Completed." });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the form.", error });
    }
};

exports.getClassRoomForms = async (req, res) => {
    const userId = req?.user?.id;
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    try {
        const GetAllForms = await CoScholastic.find(queryFilter)
            .sort({ createdAt: -1 })
            .populate({ path: 'teacherID', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'createdBy', select: '-password -mobile -employeeId -customId' })
            .populate({ path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId -customId' });
            
        if (!userId) {
            return res.status(403).json({ message: "You do not have permission." });
        }
        res.status(200).send(GetAllForms)
    } catch (error) {
        res.status(500).send({ error: error, message: "something went wrong" })
    }
}

exports.ReminderForm = async (req, res) => {
    try {
        const userId = req?.user?.id;
        const formId = req?.params?.id;

        const [UserDetails, FormDetails] = await Promise.all([
            User.findById(userId),
            CoScholastic.findById(formId)
                .populate({ path: 'teacherID', select: '-password -mobile -employeeId -customId' })
                .populate({ path: 'createdBy', select: '-password -mobile -employeeId -customId' })
                .populate({ path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId -customId' })
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

        const route = `co-scholastic/create/${FormDetails?._id}`;
        const emailData = reminderEmail({
          recipientName: receiverName,
          senderName: sender,
          formTitle: "Co-Scholastic Classroom Observation",
          formRoute: route,
        });
        await sendEmail(receiverEmail, emailData.subject, emailData.html);
        return res.status(200).json({ success: true, message: "Reminder sent successfully." });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.deleteForm = async (req, res) => {
    const formId = req.params.id;
    try {
        const deletedForm = await CoScholastic.findByIdAndDelete(formId);
        if (!deletedForm) {
            return res.status(404).json({ message: "Form not found." });
        }
        res.status(200).json({ message: "Form deleted successfully.", success: true });
    } catch (error) {
        res.status(500).json({ message: "Error deleting form.", error: error.message });
    }
};
