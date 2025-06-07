const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    FirstName : {type:String , required:true},
    LastName : {type:String , required:true},
    Email : {type:String , required:true},
    Password : {type:String , required : true},
    Gender : {type:String },
    MoblieNumber : {type:Number},
    BirthDate : {type:Date}
})

module.exports = mongoose.model('Users', userSchema)