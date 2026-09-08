const mongoose = require('mongoose');
const { Schema } = mongoose;

const BasicDetails = new Schema({
    NameoftheVisitingTeacher:{ type: Schema.Types.ObjectId, ref: 'User', required:true },
    DateOfObservation :{type:Date},
    // className:{type: Schema.Types.ObjectId, ref: 'ClassDetails', required:true},
    className:{type:String, required:true},
    Section:{type:String, required:true},
    Subject:{type:String, required:true},
    Topic:{type:String, required:true},
    LessonTakenBy:{type:String},
})


const classroomWalkthrough = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required:true },
    grenralDetails:BasicDetails,
    ratingScale:{},
    rangeOfGrade:{},
    essentialAggrements:{type:Array},
    planingAndPreparation:{type:Array},
    classRoomEnvironment:{type:Array},
    instruction:{type:Array},
    totalScores:{type:String},
    scoreOutof:{type:String},
    percentageScore:{type:String},
    Grade:{type:String},
    NumberofParametersNotApplicable:{type:String},
    isObserverCompleted:{type:Boolean},
    ObserverFeedback:{type:Array},
    isTeacherCompletes:{type:Boolean},
    TeacherFeedback:{type:Array},
    teacherID: { type: Schema.Types.ObjectId, ref: 'User' },
    isDraft: { type: Boolean, default: true },
    currentStep: { type: Number, default: 0 },
}, { timestamps: true })

const Form2 = mongoose.model('Form2', classroomWalkthrough);
module.exports = Form2;
