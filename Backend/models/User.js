const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    customId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    access: { type: String, enum: ['Superadmin', 'Observer', 'Teacher'], required: true },
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

// Normalize legacy 'OT' records to Observer + isDualRole, and scope Observer-only privileges
userSchema.pre('validate', function (next) {
    if (this.access === 'OT') {
        this.access = 'Observer';
        this.isDualRole = true;
    }
    if (this.access !== 'Observer') {
        this.isDualRole = false;
        this.canAddNotebookComment = false;
    }
    next();
});

userSchema.pre('save', async function (next) {
    if (this.isDualRole && this.access === 'Observer') {
        this.roles = ['Observer', 'Teacher'];
    } else {
        this.isDualRole = false;
        this.roles = this.access ? [this.access] : [];
    }
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
