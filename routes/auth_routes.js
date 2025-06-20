const express = require('express');
const { signinUser, signupUser , signinDoctor,signupDoctor } = require('../controllers/auth_controller');
const router = express.Router();

router.post('/signupUser' , signupUser);
router.post('/signinUser' , signinUser);
router.post('/signupDoctor' , signupDoctor);
router.post('/signinDoctor' , signinDoctor);


module.exports = router;