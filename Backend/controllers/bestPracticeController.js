const BestPractice = require('../models/BestPractice');

/**
 * Get all database-stored best practices
 * GET /api/best-practices
 */
exports.getBestPractices = async (req, res) => {
    try {
        const practices = await BestPractice.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: practices.length,
            data: practices,
        });
    } catch (error) {
        console.error('[bestPracticeController:getBestPractices] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve best practices.',
            error: error.message,
        });
    }
};

/**
 * Create a new best practice (Admin only)
 * POST /api/best-practices
 */
exports.createBestPractice = async (req, res) => {
    try {
        if (req.user?.access !== 'Superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access restricted: Only administrators can add best practices.',
            });
        }

        const {
            title,
            teacher,
            brief,
            grade,
            theme,
            competency,
            pedagogy,
            atype,
            nep,
            lo,
            tlp,
            duration,
            resources,
            atool_text,
            evid_text,
            remedial_text,
            refs,
            ksf,
            images,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Practice title is required.',
            });
        }

        if (!teacher || !teacher.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Teacher name is required.',
            });
        }

        // Generate next unique id (minimum 100 to avoid conflicting with existing seed ids)
        const highestPractice = await BestPractice.findOne().sort({ id: -1 });
        const nextId = highestPractice && highestPractice.id >= 100
            ? highestPractice.id + 1
            : 101;

        const newPractice = new BestPractice({
            id: req.body.id || nextId,
            title: title.trim(),
            teacher: teacher.trim(),
            brief: brief ? brief.trim() : '',
            grade: Array.isArray(grade) ? grade : (grade ? [grade] : []),
            theme: Array.isArray(theme) ? theme : (theme ? [theme] : []),
            competency: Array.isArray(competency) ? competency : (competency ? [competency] : []),
            pedagogy: Array.isArray(pedagogy) ? pedagogy : (pedagogy ? [pedagogy] : []),
            atype: Array.isArray(atype) ? atype : (atype ? [atype] : []),
            nep: Array.isArray(nep) ? nep : (nep ? [nep] : []),
            lo: lo || '',
            tlp: tlp || '',
            duration: duration || '',
            resources: resources || '',
            atool_text: atool_text || '',
            evid_text: evid_text || '',
            remedial_text: remedial_text || '',
            refs: refs || '',
            ksf: ksf || '',
            images: Array.isArray(images) ? images : [],
            createdBy: req.user?.id || req.user?._id,
        });

        const saved = await newPractice.save();

        return res.status(201).json({
            success: true,
            message: 'Best practice added successfully.',
            data: saved,
        });
    } catch (error) {
        console.error('[bestPracticeController:createBestPractice] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create best practice.',
            error: error.message,
        });
    }
};

/**
 * Delete a best practice (Admin only)
 * DELETE /api/best-practices/:id
 */
exports.deleteBestPractice = async (req, res) => {
    try {
        if (req.user?.access !== 'Superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access restricted: Only administrators can remove best practices.',
            });
        }

        const { id } = req.params;
        const query = isNaN(id) ? { _id: id } : { id: Number(id) };

        const deleted = await BestPractice.findOneAndDelete(query);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Best practice not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Best practice removed successfully.',
            data: deleted,
        });
    } catch (error) {
        console.error('[bestPracticeController:deleteBestPractice] Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete best practice.',
            error: error.message,
        });
    }
};

