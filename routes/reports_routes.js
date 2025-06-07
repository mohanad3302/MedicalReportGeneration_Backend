const express = require('express');
const {EditReport, getReportsByUserId ,getreportsByDoctorId} = require('../controllers/reports_controller');
const router = express.Router();

router.put('/edit_report/:reportId', EditReport);
router.get('/user_reports/:userId', getReportsByUserId);
router.get('/doctor_reports/:doctorId', getreportsByDoctorId);

module.exports = router;
