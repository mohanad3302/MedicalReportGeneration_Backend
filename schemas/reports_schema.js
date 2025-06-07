const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    UserId : { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    DoctorId : { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors' },
    XrayImageId : { type: mongoose.Schema.Types.ObjectId, ref: 'XrayImages' },
    Imression: { type: String },
    Findings: { type: String },
    ReportDate: { type: Date, default: Date.now },
    Status: { type: String, enum: ['Pending' , 'Completed'], default: 'Pending' }
})

module.exports = mongoose.model('Reports', reportSchema);