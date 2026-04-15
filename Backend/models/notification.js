const mongoose = require('mongoose');
const { Schema } = mongoose;

// CreationDetails Schema for the creator of the form
const notification = new Schema({
    title:{ type: String, required: true },
    route:{ type: String, required: true },
    date:{ type: Date, required: true },
    reciverId:{ type: Schema.Types.ObjectId, ref: 'User' },
    status:{ type: String, enum: ['seen', 'unSeen'], default: 'unSeen' }
}, { timestamps: true })

module.exports = mongoose.model('notification', notification);
