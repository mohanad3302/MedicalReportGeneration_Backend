const express = require('express');
const {process_image} = require('../controllers/model_controller');
const router = express.Router();


router.post('/process_image/:userId' ,process_image);

module.exports = router;