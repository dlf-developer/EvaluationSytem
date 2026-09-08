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
    try {
        if (req.user.access !== 'Superadmin') {
            return res.status(401).send({ success: false, error: 'Unauthorized' });
        }

        const classDetail = await ClassDetails.findById(req.params.id);
        if (!classDetail) {
            return res.status(404).send({ success: false, message: 'Class not found' });
        }

        const { className, sections, subjects } = req.body;

        if (className !== undefined && typeof className === 'string' && className.trim() !== '') {
            classDetail.className = className.trim();
        }

        if (Array.isArray(sections)) {
            classDetail.sections = sections
                .map((s) => {
                    if (typeof s === 'string') return { name: s.trim() };
                    if (s && typeof s === 'object' && s.name) return { name: s.name.trim() };
                    return null;
                })
                .filter(Boolean);
        }

        if (Array.isArray(subjects)) {
            classDetail.subjects = subjects
                .map((s) => {
                    if (typeof s === 'string') return { name: s.trim() };
                    if (s && typeof s === 'object' && s.name) return { name: s.name.trim() };
                    return null;
                })
                .filter(Boolean);
        }

        await classDetail.save();
        return res.status(200).send({
            success: true,
            message: "Class details updated successfully",
            classDetail
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error updating class details", error: error.message });
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