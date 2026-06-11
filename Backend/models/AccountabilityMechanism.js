const mongoose = require('mongoose');
const { Schema } = mongoose;

const teacherScoreSchema = new Schema({
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    teacherName: { type: String },

    // Page 2 — Auto-calculated from existing forms
    classroomWalkthroughAvg: { type: Number, default: 0 },
    classroomWalkthroughCount: { type: Number, default: 0 },
    notebookCheckingAvg: { type: Number, default: 0 },
    notebookCheckingCount: { type: Number, default: 0 },

    // Page 2 — Manual entries
    lessonPlanScore: { type: Number, default: 0 },       // out of 10
    lessonPlanScore_na: { type: Boolean, default: false },
    qualityOfQPScore: { type: Number, default: 0 },      // out of 10
    qualityOfQPScore_na: { type: Boolean, default: false },

    // Page 3 — DA Average
    daT1: { type: Number, default: 0 },
    daT1_na: { type: Boolean, default: false },
    daT2: { type: Number, default: 0 },
    daT2_na: { type: Boolean, default: false },
    daT1Low: { type: Number, default: 0 },
    daT1Low_na: { type: Boolean, default: false },
    daT1High: { type: Number, default: 0 },
    daT1High_na: { type: Boolean, default: false },
    daAverage: { type: Number, default: 0 },             // auto = avg of above 4
    daAverage_na: { type: Boolean, default: false },

    // Page 3 — Mindspark
    mindspark: { type: Number, default: 0 },             // out of 10
    mindspark_na: { type: Boolean, default: false },

    // Page 3 — Annual / Half-Yearly Result Mean
    sec1: { type: Number, default: 0 },
    sec1_na: { type: Boolean, default: false },
    sec2: { type: Number, default: 0 },
    sec2_na: { type: Boolean, default: false },
    sec3: { type: Number, default: 0 },
    sec3_na: { type: Boolean, default: false },
    sec4: { type: Number, default: 0 },
    sec4_na: { type: Boolean, default: false },
    annualTotal: { type: Number, default: 0 },           // number field (manual)
    annualTotal_na: { type: Boolean, default: false },
    annualReducedTo10: { type: Number, default: 0 },     // auto = (sec1+sec2+sec3+sec4)/annualTotal * 10
    annualReducedTo10_na: { type: Boolean, default: false },

    // Page 3 — MicroTeaching
    microTeaching: { type: Number, default: 0 },         // out of 20
    microTeaching_na: { type: Boolean, default: false },

    // Page 4 — Summary (calculated)
    totalScore: { type: Number, default: 0 },            // auto = sum of all out of 100
    maxMarks: { type: Number, default: 100 },
    percentage: { type: Number, default: 0 },            // auto = totalScore/100 * 100
}, { _id: false });

const accountabilitySchema = new Schema({
    formName: { type: String, trim: true },
    fromDate: { type: Date },
    toDate: { type: Date },
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDraft: { type: Boolean, default: true },
    isComplete: { type: Boolean, default: false },

    // Per-teacher scored data (one entry per selected teacher)
    teacherScores: [teacherScoreSchema],

    // Page 4 — Shared text fields
    cpdHours: { type: Number },
    fieldTrips: { type: Number },
    excursions: { type: Number },
    outdoorAct: { type: Number },
    smilies: { type: Number },
    contributionAchievement: { type: String },
    overallRemarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AccountabilityMechanism', accountabilitySchema);
