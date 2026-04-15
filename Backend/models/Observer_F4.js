const mongoose = require('mongoose');
const { Schema } = mongoose;

// Weekly Schema
const weekly1 = new Schema({
    ClassAndSection: { type: String, required: true },
    Date: { type: Date, required: true },
    Teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedback: { type: String, required: true },
});

// Observer_F4 Schema
const Observer_F4 = new Schema({
    Fortnightly_Monitor: {
        week1: { type: [weekly1], required: true },
        week2: { type: [weekly1], required: true },
        week3: { type: [weekly1], required: true },
        week4: { type: [weekly1], required: true },
    },
    Classroom_Walkthrough: {
        week1: { type: [weekly1], required: true },
        week2: { type: [weekly1], required: true },
        week3: { type: [weekly1], required: true },
        week4: { type: [weekly1], required: true },
    },
    Notebook_Checking: {
        week1: { type: [weekly1], required: true },
        week2: { type: [weekly1], required: true },
        week3: { type: [weekly1], required: true },
        week4: { type: [weekly1], required: true },
    },
    isObserverComplete: { type: Boolean, required: true },
    SartDate: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Observer_F4', Observer_F4);
