const ClassDetails = require('../models/ClassDetails');

// Create a new class detail
exports.createClassDetail = async (req, res) => {
    try {
        if (req.user.access !== 'Superadmin') {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const classDetail = new ClassDetails(req.body);
        await classDetail.save();
        return res.status(200).send({ success: true, message: "Class Created successfully" });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Something Went Wrong", error: error.message });
    }
};

// Get all class details
exports.getAllClassDetails = async (req, res) => {
    try {
        const classDetails = await ClassDetails.find({}).sort({ createdAt: -1 });
        return res.status(200).send({ success: true, message: "Class Fetch successfully", classDetails });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Something Went Wrong", error: error.message });
    }
};

// Get a class detail by ID
exports.getClassDetailById = async (req, res) => {
    try {
        if (req.user.access !== 'Superadmin') {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const classDetail = await ClassDetails.findById(req.params.id);
        if (!classDetail) {
            return res.status(404).send();
        }
        return res.status(200).send(classDetail);
    } catch (error) {
        return res.status(500).send(error);
    }
};

// Update a class detail by ID
exports.updateClassDetailById = async (req, res) => {
    if (req.user.access !== 'Superadmin') {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    const updates = Object.keys(req.body);
    const allowedUpdates = ['className', 'sections'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const classDetail = await ClassDetails.findById(req.params.id);
        if (!classDetail) {
            return res.status(404).send();
        }

        updates.forEach((update) => classDetail[update] = req.body[update]);
        await classDetail.save();
        return res.status(200).send(classDetail);
    } catch (error) {
        return res.status(400).send(error);
    }
};

// Delete a class detail by ID
exports.deleteClassDetailById = async (req, res) => {
    try {
        if (req.user.access !== 'Superadmin') {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const classDetail = await ClassDetails.findByIdAndDelete(req.params.id);
        if (!classDetail) {
            return res.status(404).send();
        }
        return res.status(200).send({ success: true, message: "Record has been deleted!" });
    } catch (error) {
        return res.status(500).send(error);
    }
};