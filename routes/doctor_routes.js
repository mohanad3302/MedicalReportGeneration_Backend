const express = require('express');
const {getDoctorData , getDoctorReportStatsSummary , getDoctorWeeklyStatus } = require('../controllers/doctor_controller');
const router = express.Router();

router.get('/doctorData/:doctorId', getDoctorData);
router.get('/doctorReportStatsSummary/:doctorId', getDoctorReportStatsSummary);
router.get('/doctorWeeklyStatus/:doctorId', getDoctorWeeklyStatus);


module.exports = router;
