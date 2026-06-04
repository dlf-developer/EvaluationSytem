const AccountabilityMechanism = require('../models/AccountabilityMechanism');
const Form2 = require('../models/Form2');   // Classroom Walkthrough
const Form3 = require('../models/Form3');   // Notebook Checking

// ── Score helpers ─────────────────────────────────────────────────────────────

/**
 * Convert a Form2 (Classroom Walkthrough) percentageScore to a score out of 10.
 * The model already stores percentageScore (0-100), so we divide by 10.
 */
const walkAvg = (forms) => {
    if (!forms || forms.length === 0) return 0;
    const validScores = forms.filter(f => 
        (f.percentageScore != null && f.percentageScore !== "") || 
        (f.totalScores != null && f.scoreOutof != null && f.scoreOutof !== "0")
    );
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, f) => {
        let pct = 0;
        if (f.percentageScore) {
            pct = parseFloat(f.percentageScore);
        } else {
            pct = (parseFloat(f.totalScores) / parseFloat(f.scoreOutof)) * 100;
        }
        return acc + (isNaN(pct) ? 0 : pct);
    }, 0);
    return parseFloat((sum / validScores.length / 10).toFixed(2));
};

/**
 * Convert a Form3 (Notebook Checking) score to out of 10.
 * Form3 stores totalScores and scoreOutof fields.
 */
const notebookAvg = (forms) => {
    if (!forms || forms.length === 0) return 0;
    
    let totalPctSum = 0;
    let validFormsCount = 0;

    forms.forEach(f => {
        let totalScore = 0;
        let outOfScore = 0;
        
        if (f.ObserverForm) {
            const sections = [
                "maintenanceOfNotebooks",
                "qualityOfOppurtunities",
                "qualityOfTeacherFeedback",
                "qualityOfLearner"
            ];
            
            sections.forEach(sec => {
                if (f.ObserverForm[sec] && Array.isArray(f.ObserverForm[sec])) {
                    f.ObserverForm[sec].forEach(item => {
                        const ans = item?.answer;
                        if (ans === "1" || ans === "2" || ans === "3") {
                            totalScore += parseInt(ans, 10);
                            outOfScore += 3;
                        }
                    });
                }
            });
        }
        
        if (outOfScore > 0) {
            const pct = (totalScore / outOfScore) * 100;
            totalPctSum += pct;
            validFormsCount++;
        }
    });

    if (validFormsCount === 0) return 0;
    return parseFloat((totalPctSum / validFormsCount / 10).toFixed(2));
};

// ── Create ────────────────────────────────────────────────────────────────────
const createAccountability = async (req, res) => {
    try {
        const userId = req.user.id;
        const newForm = new AccountabilityMechanism({ userId, isDraft: true, isComplete: false });
        await newForm.save();
        res.status(201).json({ success: true, message: 'Accountability form created', data: newForm });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating form', error: error.message });
    }
};

// ── Get all (for current user) ────────────────────────────────────────────────
const getAccountabilities = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const forms = await AccountabilityMechanism.find({ userId })
            .sort({ createdAt: -1 })
            .populate('userId', '-password -mobile -employeeId')
            .populate('teachers', '-password -mobile -employeeId');
        res.status(200).json({ success: true, data: forms });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching forms', error: error.message });
    }
};

// ── Get single ────────────────────────────────────────────────────────────────
const getSingleAccountability = async (req, res) => {
    try {
        const form = await AccountabilityMechanism.findById(req.params.id)
            .populate('userId', '-password -mobile -employeeId')
            .populate('teachers', '-password -mobile -employeeId');
        if (!form) return res.status(404).json({ success: false, message: 'Form not found' });
        res.status(200).json({ success: true, data: form });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching form', error: error.message });
    }
};

// ── Update / Save draft ───────────────────────────────────────────────────────
const updateAccountability = async (req, res) => {
    try {
        const updated = await AccountabilityMechanism.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('teachers', '-password -mobile -employeeId');
        if (!updated) return res.status(404).json({ success: false, message: 'Form not found' });
        res.status(200).json({ success: true, message: 'Saved successfully', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving form', error: error.message });
    }
};

// ── Publish ───────────────────────────────────────────────────────────────────
const publishAccountability = async (req, res) => {
    try {
        const updated = await AccountabilityMechanism.findByIdAndUpdate(
            req.params.id,
            { ...req.body, isDraft: false, isComplete: true },
            { new: true }
        ).populate('teachers', '-password -mobile -employeeId');
        if (!updated) return res.status(404).json({ success: false, message: 'Form not found' });
        res.status(200).json({ success: true, message: 'Published successfully', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error publishing form', error: error.message });
    }
};

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteAccountability = async (req, res) => {
    try {
        const deleted = await AccountabilityMechanism.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Form not found' });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting form', error: error.message });
    }
};

// ── Calculate per-teacher scores from existing forms ─────────────────────────
const calculateTeacherScores = async (req, res) => {
    try {
        const { teacherIds, fromDate, toDate } = req.body;

        if (!Array.isArray(teacherIds) || teacherIds.length === 0 || !fromDate || !toDate) {
            return res.status(400).json({ success: false, message: 'teacherIds, fromDate and toDate are required' });
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        const results = await Promise.all(
            teacherIds.map(async (teacherId) => {
                // Classroom Walkthrough (Form2): teacher is NameoftheVisitingTeacher or createdBy
                const walkthroughForms = await Form2.find({
                    $or: [
                        { 'grenralDetails.NameoftheVisitingTeacher': teacherId },
                        { createdBy: teacherId },
                    ],
                    isTeacherCompletes: true,
                    isObserverCompleted: true,
                    createdAt: { $gte: from, $lte: to },
                }).select('percentageScore totalScores scoreOutof');

                // Notebook Checking (Form3): teacher is teacherID or createdBy
                const notebookForms = await Form3.find({
                    $or: [
                        { teacherID: teacherId },
                        { createdBy: teacherId },
                    ],
                    isTeacherComplete: true,
                    isObserverComplete: true,
                    createdAt: { $gte: from, $lte: to },
                }).select('ObserverForm');

                return {
                    teacherId,
                    classroomWalkthroughAvg: walkAvg(walkthroughForms),
                    classroomWalkthroughCount: walkthroughForms.length,
                    notebookCheckingAvg: notebookAvg(notebookForms),
                    notebookCheckingCount: notebookForms.length,
                };
            })
        );

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error calculating scores', error: error.message });
    }
};

module.exports = {
    createAccountability,
    getAccountabilities,
    getSingleAccountability,
    updateAccountability,
    publishAccountability,
    deleteAccountability,
    calculateTeacherScores,
};
