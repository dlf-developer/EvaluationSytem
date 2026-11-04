const notification = require("../models/notification");

exports.getNotification = async (req, res) => {
    const userId = req.user.id;
    try {
        const data = await notification.find({ reciverId: userId }).sort({ date: -1 }).limit(50);
        res.status(200).send(data);
    } catch (err) {
        res.status(400).send(err);
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await notification.findOneAndUpdate(
            { _id: id, reciverId: req.user.id },
            { status: 'seen' },
            { new: true }
        );
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await notification.updateMany(
            { reciverId: req.user.id, status: 'unSeen' },
            { status: 'seen' }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as seen' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.clearAll = async (req, res) => {
    try {
        await notification.deleteMany({ reciverId: req.user.id });
        res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
