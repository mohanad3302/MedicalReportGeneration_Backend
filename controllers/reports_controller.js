const reports_schema = require('../schemas/reports_schema');
const Reports = require('../schemas/reports_schema');

async function EditReport(req, res) {
    try {
        const { reportId } = req.params;
        const { Imression, Findings } = req.body;

        if (!Imression || !Findings) {
            return res.status(400).json({ message: 'Impression and Findings are required' });
        }

        const updatedReport = await Reports.findByIdAndUpdate(
            reportId,
            { Imression, Findings },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getReportsByUserId(req, res) {
    try {
        const { userId } = req.params;

        console.log(`Fetching reports for user ID: ${userId}`);
        const reports = await Reports.find({ UserId: userId });

        if (reports.length === 0) {
            return res.status(404).json({ message: 'No reports found for this user' });
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getreportsByDoctorId(req, res) {
    try {
        const { doctorId } = req.params;

        const reports = await Reports.find({ DoctorId: doctorId });

        if (reports.length === 0) {
            return res.status(404).json({ message: 'No reports found for this doctor' });
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    EditReport,
    getReportsByUserId,
    getreportsByDoctorId
};