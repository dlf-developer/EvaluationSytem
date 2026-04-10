const User = require("../models/User");
const sendEmail = require("../utils/emailService");
const Form1 = require("../models/Form1");
const Notification = require("../models/notification");
const Activity = require("../models/Activity");

// Create Form
exports.createForm = async (req, res) => {
  const {
    className,
    section,
    date,
    isCoordinator,
    coordinatorID,
    isTeacher,
    teacherID,
    observerID,
  } = req.body;
  const userId = req?.user?.id;

  try {
    if (!className || !section || !date || (!isCoordinator && !isTeacher)) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let recipient, recipientType;
    let formData;

    // Determine recipient type and fetch data
    if (isCoordinator && coordinatorID) {
      recipient = await User.findById(coordinatorID);
      recipientType = "Coordinator";
    } else if (isTeacher && teacherID) {
      recipient = await User.findById(teacherID);
      recipientType = "Teacher";
    }

    if (!recipient) {
      return res.status(404).json({ message: `${recipientType} not found.` });
    }

    formData = new Form1({
      userId,
      className,
      section,
      date: new Date(date),
      isCoordinator,
      isTeacher,
      coordinatorID: isCoordinator ? coordinatorID : undefined,
      teacherID: isTeacher ? teacherID : undefined,
      observerForm: {},
      teacherForm: {},
    });

    await formData.save();

    // Send email and notification
    const recipientEmail = recipient?.email;
    if (recipientEmail) {
      const subject = "New Fortnightly Monitor Form Created";
      const body = `A new Fortnightly Monitor Form has been created for Class: ${className}, Section: ${section}. 
        Click here to fill the form: https://abcd.com/form/${formData._id}`;
      // sendEmail(recipientEmail, subject, body);

      const notification = new Notification({
        title: `You are invited to fill the Fortnightly Monitor Form`,
        route: `fortnightly-monitor/create/${formData._id}`,
        reciverId: recipient._id,
        date: new Date(),
        status: "unSeen",
      });
      await notification.save();
    }

    res
      .status(201)
      .json({
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

// Form Initiation
exports.FormInitiation = async (req, res) => {
  const { isTeacher, teacherIDs } = req.body;
  const userId = req?.user?.id;

  try {
    if (isTeacher && Array.isArray(teacherIDs) && teacherIDs.length > 0) {
      const forms = await Promise.all(
        teacherIDs.map(async (id) => {
          const teacher = await User.findById(id);
          if (!teacher?.email) return null;

          const formData = new Form1({
            userId,
            isTeacher,
            isObserverInitiation: true,
            observerForm: {},
            teacherForm: {},
            teacherID: teacher._id,
          });

          await formData.save();

          const subject = "New Fortnightly Monitor Form Created";
          const body = `A new Fortnightly Monitor Form has been created. 
            Click here to fill the form: https://abcd.com/form/${formData._id}`;
          // sendEmail(teacher.email, subject, body);

          const notification = new Notification({
            title: `You are invited to fill the Fortnightly Monitor Form`,
            route: `fortnightly-monitor/initiate/create/${formData._id}`,
            reciverId: teacher._id,
            date: new Date(),
            status: "unSeen",
          });
          await notification.save();

          return formData;
        }),
      );

      const validForms = forms.filter(Boolean);
      if (validForms.length > 0) {
        return res
          .status(201)
          .json({ message: "Forms created successfully!", forms: validForms });
      }
    }

    return res
      .status(400)
      .json({ message: "Invalid data. Teacher IDs are required." });
  } catch (error) {
    console.error("Error initiating forms:", error);
    res.status(500).json({ message: "Error initiating forms.", error });
  }
};

// Get Forms for User
exports.getUserForm = async (req, res) => {
  const userId = req?.user?.id;

  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    const initiatedForms = await Form1.find({ userId, ...queryFilter }).populate(
      "teacherID coordinatorID userId",
    );
    const assignedForms = await Form1.find({ teacherID: userId, ...queryFilter }).populate(
      "teacherID coordinatorID userId",
    );

    // Combine both arrays while avoiding duplicates based on _id
    const combinedForms = [
      ...initiatedForms,
      ...assignedForms.filter(
        (assignedForm) =>
          !initiatedForms.some(
            (initiatedForm) =>
              initiatedForm._id.toString() === assignedForm._id.toString(),
          ),
      ),
    ];

    res
      .status(200)
      .json({
        Combined: combinedForms,
        Initiated: initiatedForms,
        Assigned: assignedForms,
      });
  } catch (error) {
    console.error("Error fetching user forms:", error);
    res.status(500).json({ message: "Error fetching user forms.", error });
  }
};

// Get Observer Dashboard
exports.getObserverDashboard = async (req, res) => {
  const { observerID, TeacherID } = req.body;

  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
    let query = { ...queryFilter };
    if (observerID) {
      query = { isCoordinatorComplete: false, coordinatorID: observerID, ...queryFilter };
    } else if (TeacherID) {
      query = { isTeacherComplete: false, teacherID: TeacherID, ...queryFilter };
    }

    const forms = await Form1.find(query)
      .populate("teacherID", "-password")
      .populate("coordinatorID", "-password")
      .populate("userId", "-password");

    if (forms.length === 0) {
      return res
        .status(404)
        .json({ message: "No forms available for filling." });
    }

    res.status(200).json({ forms });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data.", error });
  }
};

// Reusable populate options
const populateOptions = [
  {
    path: "teacherID",
    select: "-password -mobile -employeeId -customId",
  },
  {
    path: "userId",
    select: "-password -mobile -employeeId -customId",
  },
  {
    path: "coordinatorID",
    select: "-password -mobile -employeeId -customId",
  },
];

exports.GetObserverForm01 = async (req, res) => {
  const userId = req?.user?.id; // Fetch user ID from the request

  if (!userId) {
    return res.status(403).json({ message: "You do not have permission." });
  }

  try {
    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    // Query forms assigned to the user
    const Assigned = await Form1.find({ coordinatorID: userId, ...queryFilter })
      .populate(populateOptions)
      .populate("className")
      .sort({ createdAt: -1 });

    // Query forms with observer initiation
    const Initiated = await Form1.find({ userId, isObserverInitiation: true, ...queryFilter })
      .populate(populateOptions)
      .populate("className")
      .sort({ createdAt: -1 });

    // Combine both arrays while avoiding duplicates based on _id
    const Combined = [
      ...Assigned,
      ...Initiated.filter(
        (initiatedForm) =>
          !Assigned.some(
            (assignedForm) =>
              assignedForm._id.toString() === initiatedForm._id.toString(),
          ),
      ),
    ];

    // Return combined forms along with separate arrays
    res.status(200).json({ Combined, Assigned, Initiated });
  } catch (error) {
    console.error("Error Getting Classroom Walkthrough:", error);
    res
      .status(500)
      .json({
        message: "Error Getting Classroom Walkthrough.",
        error: error.message,
      });
  }
};

//teacher form 1 ko jab edit karta hai tab tab ye function kam karta hai
exports.EditUpdate = async (req, res) => {
  const formId = req.params.id;
  const userId = req?.user?.id;

  // Validate form ID
  if (!formId) {
    return res.status(400).json({ message: "Form ID is required" });
  }

  try {
    const { observerForm, teacherForm } = req.body;

    // Check if at least one update field is provided
    if (!observerForm && !teacherForm) {
      return res.status(400).json({ message: "No update data provided" });
    }

    // Find and update the form
    const updateData = {
      ...(observerForm && { observerForm }),
      ...(teacherForm && { teacherForm }),
    };

    const updatedForm = await Form1.findByIdAndUpdate(formId, updateData, {
      new: true,
    }).populate("teacherID");

    // Check if the form exists
    if (!updatedForm) {
      return res
        .status(404)
        .json({ message: "Form not found", success: false });
    }

    // const newActivity = new Activity({
    //              userId,
    //              title: "Fortnightly Monitor",
    //              form1: {
    //                message: "Fortnightly Monitor Form edit successfully",
    //                router: `fortnightly-monitor/update/id`,
    //              },
    //            });
    //            await newActivity.save();

    const newActivity = await Activity.findOneAndUpdate(
      {
        userId,
        "form1.router": `fortnightly-monitor/update/id`,
      },
      {
        $set: {
          title: "Fortnightly Monitor",
          "form1.message": "Fortnightly Monitor Form edit successfully",
          updatedAt: new Date(),
        },
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new entry if not found
      },
    );

    // Send a success response
    res.status(200).json({
      message: "Form updated successfully!",
      success: true,
    });
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({
      message: "Error updating the form.",
      error: error.message,
    });
  }
};
