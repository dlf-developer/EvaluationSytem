const WingCoordinator = require("../models/WingCoordinator");
const Form1 = require("../models/Form1");
const Form2 = require("../models/Form2");
const Form3 = require("../models/Form3");
const Weekly4Form = require("../models/Weekly4Form");
const CoScholastic = require("../models/CoScholastic");

// ✅ Create a new WingCoordinator entry
const createWingCoordinator = async (req, res) => {
    try {
        const userId = req.user.id;
        // const { className, range,form1, form2, form3, form4} = req.body
        const newWing = new WingCoordinator({userId,isDraft:true,isComplete:false});
        await newWing.save();
        res.status(201).json({ success: true, message: 'Wing Coordinator form created successfully', data: newWing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating WingCoordinator', error: error.message });
    }
};

// ✅ Get all WingCoordinator entries (Filter by userId if provided)
const getWingCoordinators = async (req, res) => {
    try {
        const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
        const filter = req.query.userId ? { userId: req.query.userId, ...queryFilter } : { ...queryFilter };
        const wings = await WingCoordinator.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: wings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching WingCoordinators', error: error.message });
    }
};

// ✅ Get a single WingCoordinator entry by ID
const getSingleWingCoordinatorById = async (req, res) => {
    try {
        const wing = await WingCoordinator.findById(req.params.id).populate("userId","-password -coordinator -designation -email -updatedAt -__v");
        if (!wing) return res.status(404).json({ success: false, message: 'WingCoordinator not found' });

        res.status(200).json({ success: true, data: wing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching WingCoordinator', error: error.message });
    }
};



const getWingCoordinatorById = async (req, res) => {
    try {
        const queryFilter = req.sessionDateFilter ? { createdAt: req.sessionDateFilter } : {};
        const wing = await WingCoordinator.find({userId:req.params.id, ...queryFilter}).sort({ createdAt: -1 }).populate("userId","-password -coordinator -designation -email -updatedAt -__v");
        if (!wing) return res.status(404).json({ success: false, message: 'WingCoordinator not found' });

        res.status(200).json({ success: true, data: wing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching WingCoordinator', error: error.message });
    }
};




// ✅ Update a WingCoordinator entry
const updateWingCoordinator = async (req, res) => {
    try {
        const updatedWing = await WingCoordinator.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedWing) return res.status(404).json({ success: false, message: 'WingCoordinator not found' });

        res.status(200).json({ success: true, message: 'WingCoordinator updated successfully', data: updatedWing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating WingCoordinator', error: error.message });
    }
};


const publishWingCoordinator = async (req, res) => {

    try {
        const updatedWing = await WingCoordinator.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedWing) return res.status(404).json({ success: false, message: 'WingCoordinator not found' });

        res.status(200).json({ success: true, message: 'WingCoordinator updated successfully', data: updatedWing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating WingCoordinator', error: error.message });
    }
};

// ✅ Sync — re-fetch latest data for all stored form IDs and update the document
const syncWingCoordinator = async (req, res) => {
    try {
        const wing = await WingCoordinator.findById(req.params.id);
        if (!wing) return res.status(404).json({ success: false, message: 'WingCoordinator not found' });

        // Helper: re-fetch an array of form snapshots from a model
        const refresh = async (ids, Model, populate) => {
            if (!Array.isArray(ids) || ids.length === 0) return [];
            const mongoIds = ids.map(item => item?._id || item).filter(Boolean);
            let query = Model.find({ _id: { $in: mongoIds } });
            if (populate) populate.forEach(p => { query = query.populate(p); });
            return query.lean();
        };

        const [form1, form2, form3, form4, form5] = await Promise.all([
            refresh(wing.form1, Form1, [
                { path: 'teacherID', select: '-password -mobile -employeeId' },
                { path: 'userId',    select: '-password -mobile -employeeId' },
                { path: 'coordinatorID', select: '-password -mobile -employeeId' },
            ]),
            refresh(wing.form2, Form2, [
                { path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId' },
                { path: 'createdBy', select: '-password -mobile -employeeId' },
            ]),
            refresh(wing.form3, Form3, [
                { path: 'teacherID', select: '-password -mobile -employeeId' },
                { path: 'createdBy', select: '-password -mobile -employeeId' },
                { path: 'grenralDetails.NameofObserver', select: '-password -mobile -employeeId' },
            ]),
            refresh(wing.form4, Weekly4Form, [
                { path: 'teacherId', select: '-password -mobile -employeeId' },
                { path: 'isInitiated.Observer', select: '-password -mobile -employeeId' },
            ]),
            refresh(wing.form5, CoScholastic, [
                { path: 'grenralDetails.NameoftheVisitingTeacher', select: '-password -mobile -employeeId' },
                { path: 'createdBy', select: '-password -mobile -employeeId' },
            ]),
        ]);

        // Save refreshed data back to the WingCoordinator document
        wing.form1 = form1;
        wing.form2 = form2;
        wing.form3 = form3;
        wing.form4 = form4;
        wing.form5 = form5;
        await wing.save();

        res.status(200).json({
            success: true,
            message: 'Wing Coordinator synced successfully',
            data: wing,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error syncing WingCoordinator', error: error.message });
    }
};

// ✅ Delete a WingCoordinator entry
const deleteWingCoordinator = async (req, res) => {
    try {
        const deletedWing = await WingCoordinator.findByIdAndDelete(req.params.id);

        if (!deletedWing) return res.status(404).json({ success: false, message: 'WingCoordinator not found' });

        res.status(200).json({ success: true, message: 'WingCoordinator deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting WingCoordinator', error: error.message });
    }
};

// ✅ Export all functions
module.exports = {
    publishWingCoordinator,
    createWingCoordinator,
    getWingCoordinators,
    getWingCoordinatorById,
    updateWingCoordinator,
    deleteWingCoordinator,
    getSingleWingCoordinatorById,
    syncWingCoordinator,
};
