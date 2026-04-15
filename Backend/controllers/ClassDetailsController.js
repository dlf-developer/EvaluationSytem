const ClassDetails = require('../models/ClassDetails');

// Create a new class detail
exports.createClassDetail = async (req, res) => {

    try {
        req.user.access !== 'Superadmin' ? res.status(401).send({ error: 'Unauthorized' }) : null;
        const classDetail = new ClassDetails(req.body);
        await classDetail.save();
        res.status(200).send({success:true, message:"Class Created successfully"});
    } catch (error) {
        res.status(200).send({success:true, message:"Somthing Went Wrong", error:error});
    }
};

// Get all class details
exports.getAllClassDetails = async (req, res) => {
    try {
        const classDetails = await ClassDetails.find({}).sort({ createdAt: -1 });
        res.status(200).send({success:true, message:"Class Fetch successfully", classDetails});
    } catch (error) {
        res.status(500).send({success:false, message:"Something Went Wrong", error:error});

    }
};

// Get a class detail by ID
exports.getClassDetailById = async (req, res) => {
    try {
        req.user.access !== 'Superadmin' ? res.status(401).send({ error: 'Unauthorized' }) : null;
        const classDetail = await ClassDetails.findById(req.params.id);
        if (!classDetail) {
            return res.status(404).send();
        }
        res.status(200).send(classDetail);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a class detail by ID
exports.updateClassDetailById = async (req, res) => {
    req.user.access !== 'Superadmin' ? res.status(401).send({ error: 'Unauthorized' }) : null;
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
        res.status(200).send(classDetail);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a class detail by ID
exports.deleteClassDetailById = async (req, res) => {
    try {
        req.user.access !== 'Superadmin' ? res.status(401).send({ error: 'Unauthorized' }) : null;
        const classDetail = await ClassDetails.findByIdAndDelete(req.params.id);
        if (!classDetail) {
            return res.status(404).send();
        }
        res.status(200).send({success:true,message:"Reacord has beed deleted!"});
    } catch (error) {
        res.status(500).send(error);
    }
};