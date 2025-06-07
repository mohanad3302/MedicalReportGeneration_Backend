const express = require('express');
const {getUserData} = require('../controllers/user_controller');
const router = express.Router();

router.get('/userData/:userId', getUserData);

module.exports = router;
