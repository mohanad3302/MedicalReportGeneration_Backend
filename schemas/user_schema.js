const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    FirstName : {type:String , required:true},
    LastName : {type:String , required:true},
    Phone : {type:Number},
    Birthdate : {type:String},
    Gender : {type:String ,required:true},
    Email : {type:String , required:true},
    Password : {type:String , required : true},  
})

module.exports = mongoose.model('Users', userSchema)