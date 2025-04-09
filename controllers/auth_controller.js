const User = require('../schemas/user_schema');
const bcrypt = require('bcrypt');
       
  async function signup (req , res){
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
        res.status(201).json({message:"user Created successfully", FirstName : newUser.FirstName , LastName : newUser.LastName  })
        
    }

    catch(error){
        console.error(error);
        res.status.json({message: "Server error"})
    }
  }

  async function signin(req,res){
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

        res.status(200).json({message : 'User signed in successfully',  FirstName : user.FirstName , LastName : user.LastName })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  }
  
  module.exports = {
      signin,
      signup,
  }