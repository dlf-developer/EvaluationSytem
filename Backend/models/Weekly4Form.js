const mongoose = require("mongoose");
const { Schema } = mongoose;

const weekly4FormSchema = new Schema(
  {
    date: { type: Date, required: true },
    dateOfSubmission: { type: Date, required: false },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" },
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Add this if needed
    coordinatorID: { type: Schema.Types.ObjectId, ref: "User" },
    isInitiated: {
      status: { type: Boolean },
      Observer: { type: Schema.Types.ObjectId, ref: "User" },
    },
    isCompleted: { type: Boolean, default: false },
    FormData: { type: Array },
  },
  { timestamps: true },
);

module.exports = mongoose.model("weekly4Form", weekly4FormSchema);
