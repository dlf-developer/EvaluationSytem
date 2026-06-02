const mongoose = require('mongoose');
const { Schema } = mongoose;

const BasicDetails = new Schema({
    NameoftheVisitingTeacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    DateOfObservation: { type: Date },
    className: { type: String, required: true },
    Section: { type: String, required: true },
    Subject: { type: String, required: true },
    Topic: { type: String, required: true },
    LessonTakenBy: { type: String },
});

const coScholasticSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    grenralDetails: BasicDetails,
    classroomManagement: { type: Array },
    planningAndExecution: { type: Array },
    studentEngagement: { type: Array },
    instructionAndFacilitation: { type: Array },
    totalScores: { type: String },
    scoreOutof: { type: String },
    percentageScore: { type: String },
    Grade: { type: String },
    NumberofParametersNotApplicable: { type: String },
    isObserverCompleted: { type: Boolean },
    ObserverFeedback: { type: Array },
    isTeacherCompletes: { type: Boolean },
    TeacherFeedback: { type: Array },
    teacherID: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const CoScholastic = mongoose.model('CoScholastic', coScholasticSchema);
module.exports = CoScholastic;
