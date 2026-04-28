const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    customId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    access: { type: String, enum: ['Superadmin', 'Observer', 'Teacher'], required: true },
    designation: { type: String },
    coordinator: { type: String},
    hod: { type: String},
    motherTeacher: { type: String},
    subjectTeacher: { type: String },
    sclass: { type: String },
    section: { type: String },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loginOTP: String,
    loginOTPExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
