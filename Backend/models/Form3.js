const mongoose = require('mongoose');
const { Schema } = mongoose;


const BasicDetails = new Schema({
    NameofObserver:{ type: Schema.Types.ObjectId, ref: 'User', default:null},
    DateOfObservation :{type:Date, default:null},
    className:{type:String, default:null},
    Section:{type:String, default:null},
    Subject:{type:String, default:null},
});

const NoteBookSction = new Schema({
    ClassStrength:{type:String, default:null},
    NotebooksSubmitted:{type:String, default:null},
    Absentees:{type:String, default:null},
    Defaulters:{type:String, default:null}
})

const questionForm =new Schema({
    maintenanceOfNotebooks:{type:Array, default:null},
    qualityOfOppurtunities:{type:Array, default:null},
    qualityOfTeacherFeedback:{type:Array, default:null},
    qualityOfLearner:{type:Array, default:null},
})


const NotebookCheckingProforma = new Schema({
    grenralDetails:BasicDetails,
    NotebooksTeacher:NoteBookSction,
    NotebooksObserver:NoteBookSction,
    isObserverInitiation:{ type: Boolean , default:false},
    teacherID:{ type: Schema.Types.ObjectId, ref: 'User', required:false, default:null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required:false , default:null},
    isObserverComplete: {type:Boolean, default:false},
    ObserverForm:questionForm,
    isTeacherComplete:{type:Boolean, default:false},
    TeacherForm:questionForm,
    observerFeedback:{type:String, default:null},
    isReflation:{type:Boolean, default:false},
    teacherReflationFeedback:{type:String, default:null},
    isDraft: { type: Boolean, default: true },
    currentStep: { type: Number, default: 0 },

}, { timestamps: true })
const Form3 = mongoose.model('Form3',  NotebookCheckingProforma);
module.exports = Form3;