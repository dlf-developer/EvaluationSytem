const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    customId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    access: { type: String, enum: ['Superadmin', 'Observer', 'Teacher', 'OT'], required: true },
    isDualRole: { type: Boolean, default: false },
    canAddNotebookComment: { type: Boolean, default: false },
    roles: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
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
    if (this.isDualRole || this.access === 'OT') {
        this.isDualRole = true;
        this.roles = ['Observer', 'Teacher'];
    } else if (!this.roles || this.roles.length === 0) {
        this.roles = [this.access];
    }
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
