const User = require('../schemas/user_schema');
const Doctor = require('../schemas/doctor_schema');
const bcrypt = require('bcrypt');
       
async function signupUser (req , res){
  console.log(req.body)
  try{
      Email = req.body.Email
      const existingUser = await User.findOne({Email})
      if (existingUser){
          return res.status(400).json({message: "User already exists"})
      }

      const hashedPassword = await bcrypt.hash(req.body.Password , 10);
      req.body.Password = hashedPassword
      const newUser = new User(req.body)
      
      await newUser.save();
      res.status(201).json({message:"user Created successfully", FirstName : newUser.FirstName , LastName : newUser.LastName ,UserId : newUser._id })  
  }

  catch(error){
      console.error(error);
      res.status.json({message: "Server error"})
  }
}

async function signinUser (req,res){
  console.log(req.body)
  try{
      const {Email , Password} = req.body
      console.log(Email , " : " , Password)
      const user = await User.findOne({Email})
      if (!user){
          return res.status(401).json({message: 'Invalid credentials'})
      }

      const password_match = await bcrypt.compare(Password, user.Password);
      if (!password_match){
          return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.status(200).json({message : 'User signed in successfully',  FirstName : user.FirstName , LastName : user.LastName , UserId : user._id })

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
}

async function signupDoctor (req , res){
  console.log(req.body)
  try{
      Email = req.body.Email
      const existingDoctor = await Doctor.findOne({Email})
      if (existingDoctor){
          return res.status(400).json({message: "Doctor already exists"})
      }
      const hashedPassword = await bcrypt.hash(req.body.Password , 10);
      req.body.Password = hashedPassword
      const newDoctor = new Doctor(req.body)
      await newDoctor.save();
      res.status(201).json({message:"Doctor Created successfully", FirstName : newDoctor.FirstName , LastName : newDoctor.LastName ,doctorId : newDoctor._id })
  }
  catch(error){
      console.error(error);
      res.status.json({message: "Server error"})
  }
}

async function signinDoctor (req,res){
    console.log(req.body)
    try{
        const {Email , Password} = req.body
        console.log(Email , " : " , Password)
        const doctor = await Doctor.findOne({Email})
        if (!doctor){
            return res.status(401).json({message: 'Invalid credentials'})
        }
        const password_match = await bcrypt.compare(Password, doctor.Password);
        if (!password_match){
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({message : 'Doctor signed in successfully',  FirstName : doctor.FirstName , LastName : doctor.LastName , doctorId : doctor._id })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
  
  module.exports = {
      signinUser,
      signupUser,
      signinDoctor,
      signupDoctor,
  }