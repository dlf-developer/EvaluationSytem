const mongoose = require('mongoose');
const Form1 = require('./Backend/models/Form1');
require('dotenv').config({ path: './Backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/TeacherEvaluation');
  const forms = await Form1.find({ isObserverInitiation: true }).sort({ createdAt: -1 }).limit(3);
  forms.forEach(f => {
    console.log("ID:", f._id, "className:", f.className, "section:", f.section);
  });
  mongoose.disconnect();
}
run();
