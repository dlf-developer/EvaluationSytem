const mongoose = require("mongoose");
const router = require("../routes/formRoutes");

const messageSchema = new mongoose.Schema(
    {
        message:{
            type:String,
        },
        router:{
            type:String
        }
    },
    
)
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
        type: String,
    },
    form1:messageSchema,
    className: {
      type: String, 
    },
    section: {
      type: String,
    },
    userName: {
      type: String, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
