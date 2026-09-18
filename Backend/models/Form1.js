const mongoose = require('mongoose');
const { Schema } = mongoose;
const option =['Yes', 'No', 'N/A','0.5']
// Schema for observer and teacher forms
const formSchema = new Schema({
  classCleanliness: { type: String, enum: option, default: null },
  chartsPosters: { type: String, enum: option, default: null },
  furnitureCondition: { type: String, enum: option, default: null },
  electricalFixtures: { type: String, enum: option, default: null },
  studentCleanliness: { type: String, enum: option, default: null },
  classroomRules: { type: String, enum: option, default: null },

  newsUpdate: { type: String, enum: option, default: null },
  smileyChart: { type: String, enum: option, default: null },
  missionEnglishChart: { type: String, enum: option, default: null },
  birthdayChart: { type: String, enum: option, default: null },
  transportCorner: { type: String, enum: option, default: null },
  participationChart: { type: String, enum: option, default: null },
  clubHouseList: { type: String, enum: option, default: null },

  coScholasticActivityChart: { type: String, enum: option, default: null },
  unitSyllabusChart: { type: String, enum: option, default: null },
  thinkZone: { type: String, enum: option, default: null },
  digitalCitizenshipRules: { type: String, enum: option, default: null },

  dearPeriod: { type: String, enum: option, default: null },
  lunchEtiquettes: { type: String, enum: option, default: null },
  thursdaySpecial: { type: String, enum: option, default: null },
  meditation: { type: String, enum: option, default: null },
  generalDiscipline: { type: String, enum: option, default: null },

  uniformTieBeltShoesICard: { type: String, enum: option, default: null },
  isGroupOnDuty: { type: String, enum: option, default: null },
  isWeeklyRotationOfStudents: { type: String, enum: option, default: null },

  goodwillPiggyBank: { type: String, enum: option, default: null },
  classPass: { type: String, enum: option, default: null },
  classTeacherTimeTable: { type: String, enum: option, default: null },
  homeworkRegisterAQADRegister: { type: String, enum: option, default: null },

  anecdotalRegister: { type: String, enum: option, default: null },
  anecdotalQuality: { type: String, enum: option, default: null },
  supplementaryReadingRecord: { type: String, enum: option, default: null },
  ptmRecords: { type: String, enum: option, default: null },

  wasteSegregation: { type: String, enum: option, default: null },
  wasteContribution: { type: String, enum: option, default: null },
  wasteBoxesLabelled: { type: String, enum: option, default: null },
  wasteAwareness: { type: String, enum: option, default: null },
  wasteBoxesMaintenance: { type: String, enum: option, default: null },

  electronicDevices: { type: String, enum: option, default: null },

  totalScore: { type: Number, min: 0, max: 100,default:0 },
  OutOf: { type: Number, min: 0, max: 50,default:0 },
  ObservationDates: { type: Date, default: null },
}, { _id: false });

// Main schema for the creation details
const creationDetailsSchema = new Schema({
  className: { type: String},
  isObserverInitiation:{ type: Boolean },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  section: { type: String },
  date: { type: Date },
  isCoordinator: { type: Boolean },
  isCoordinatorComplete: { type: Boolean, default: false },
  coordinatorID: { type: Schema.Types.ObjectId, ref: 'User' },
  isTeacher: { type: Boolean, required: true },
  isTeacherComplete: { type: Boolean, default: false },
  teacherID: { type: Schema.Types.ObjectId, ref: 'User' },
  observerForm: { type: formSchema }, // Observer's form
  teacherForm: { type: formSchema }, // Teacher's form
  // ObservationDates: { type: Date, default: null },
  TeacherSubmissionDate: { type: Date, default: null },
  ObserverSubmissionDate: { type: Date, default: null },
  isDraft: { type: Boolean, default: true },
  currentStep: { type: Number, default: 0 },
}, { timestamps: true });

const Form1 = mongoose.model('Form1', creationDetailsSchema);
module.exports = Form1;
