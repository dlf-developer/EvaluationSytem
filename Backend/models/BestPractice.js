const mongoose = require('mongoose');

const bestPracticeSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    teacher: { type: String, required: true, trim: true },
    brief: { type: String, default: '' },
    grade: { type: [String], default: [] },
    theme: { type: [String], default: [] },
    competency: { type: [String], default: [] },
    pedagogy: { type: [String], default: [] },
    atype: { type: [String], default: [] },
    nep: { type: [String], default: [] },
    lo: { type: String, default: '' },
    tlp: { type: String, default: '' },
    duration: { type: String, default: '' },
    resources: { type: String, default: '' },
    atool_text: { type: String, default: '' },
    evid_text: { type: String, default: '' },
    remedial_text: { type: String, default: '' },
    refs: { type: String, default: '' },
    ksf: { type: String, default: '' },
    images: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('BestPractice', bestPracticeSchema);

