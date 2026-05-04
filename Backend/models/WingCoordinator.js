const mongoose = require('mongoose');
const { Schema } = mongoose;

const WingCoordinator = new Schema({
    formName:{ type: String, required: false, trim: true },
    className:{type:Array,require:true},
    range:{type:Array,require:true},
    form1:{type:Array},
    form2:{type:Array},
    form3:{type:Array},
    form4:{type:Array},
    monthlyReport:{type:Array},
    userId:{ type: Schema.Types.ObjectId, ref: 'User',require:true },
    isComplete:{type:Boolean},
    isDraft:{type:Boolean}
}, { timestamps: true });

module.exports = mongoose.model('WingCoordinator', WingCoordinator);