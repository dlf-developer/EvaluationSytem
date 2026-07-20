const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/TeacherEvaluation');
  const users = await User.find({}, 'name email access');
  console.log("TOTAL USERS IN DB:", users.length);
  users.forEach(u => {
    console.log(`Name: ${u.name} | Email: ${u.email} | Access: ${u.access}`);
  });
  mongoose.disconnect();
}
run();
