const mongoose = require("mongoose");
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



const CreateActivityModal = async (req, res) => {
  try {
    const { teacherMessage, observerMessage, route, date, reciverId, senderId, data, fromNo } = req.body;

    const validSenderId = senderId && mongoose.Types.ObjectId.isValid(senderId) ? senderId : null;
    const activityDate = date ? new Date(date) : new Date();

    // If reciverId is an array of receiver IDs (e.g. multiple teachers)
    if (Array.isArray(reciverId)) {
      const validReceiverIds = reciverId.filter((id) => id && mongoose.Types.ObjectId.isValid(id));
      if (validReceiverIds.length === 0) {
        return res.status(201).json({ success: true, message: "No valid recipients, skipped." });
      }

      const activities = await Promise.all(
        validReceiverIds.map((id) =>
          new ActivityTwo({
            teacherMessage,
            observerMessage,
            route,
            date: activityDate,
            reciverId: id,
            senderId: validSenderId,
            data,
            fromNo,
          }).save()
        )
      );
      return res.status(201).json({ success: true, activity: activities[0], activities });
    }

    // Single receiver ID
    const validReciverId = reciverId && mongoose.Types.ObjectId.isValid(reciverId) ? reciverId : null;

    const activity = new ActivityTwo({
      teacherMessage,
      observerMessage,
      route,
      date: activityDate,
      reciverId: validReciverId,
      senderId: validSenderId,
      data,
      fromNo,
    });
    await activity.save();
    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error("CreateActivityModal error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRecentActivitiesModal = async (req, res) => {
  try {
    const { fromNo } = req.query || {};
    const filter = fromNo ? { fromNo } : {};
    const activities = await ActivityTwo.find(filter).populate("reciverId senderId");
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSingleActivitiesModalById = async (req, res) => {
  const { fromNo } = req?.query || {};
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    const filter = fromNo
      ? { $or: [{ reciverId: id, fromNo }, { senderId: id, fromNo }] }
      : { $or: [{ reciverId: id }, { senderId: id }] };

    const activities = await ActivityTwo.find(filter).populate("reciverId senderId");
    
    if (!activities) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    res.status(200).json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getRecentActivities, CreateActivityModal , getRecentActivitiesModal, getSingleActivitiesModalById};

