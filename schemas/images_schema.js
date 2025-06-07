const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    UserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    ImageUrl: { type: String, required: true },
    UploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('XrayImages', imageSchema);