const Activity = require("../models/Activity");
const ActivityTwo = require("../models/SecoundActivity");

const getRecentActivities = async (req, res) => {
  try {
    const userId = req?.user?.id; // JWT Middleware se userId lena

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};

    // Sirf usi user ki activities fetch karna, filtered by active session
    const activities = await Activity.find({ userId, ...queryFilter })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Error fetching activities", error });
  }
};



const CreateActivityModal = async (req,res)=>{
  try {
    const { teacherMessage, observerMessage, route, date, reciverId, senderId, data,fromNo } = req.body;
    const activity = new ActivityTwo({ teacherMessage, observerMessage, route, date, reciverId, senderId, data,fromNo });
    await activity.save();
    res.status(201).json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

const getRecentActivitiesModal = async (req, res) => {
  try {
    const activities = await ActivityTwo.find({fromNo}).populate("reciverId senderId");
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

const getSingleActivitiesModalById = async (req, res) => {
  const {fromNo} = req?.query;
  try {
    const activities = await ActivityTwo.find({
      $or: [{ reciverId: req.params.id, fromNo }, { senderId: req.params.id,fromNo }],
    }).populate("reciverId senderId");
    
    if (!activities) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = { getRecentActivities, CreateActivityModal , getRecentActivitiesModal, getSingleActivitiesModalById};

