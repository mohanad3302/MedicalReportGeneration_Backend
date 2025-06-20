const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Phone: { type: Number },
    Gender: { type: String , required: true },
    Birthdate: { type:String},
    Email: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
});
module.exports = mongoose.model('Doctors', doctorSchema);
