const reports_schema = require('../schemas/reports_schema');
const Reports = require('../schemas/reports_schema');
const {sendEmail} = require('../controllers/notification_controller');
const User = require('../schemas/user_schema');

async function EditReport(req, res) {
    try {
        const { reportId } = req.params;
        const { action , impression, findings } = req.body;

        
        console.log(`Editing report with ID: ${reportId}`);
        console.log(req.body);



        if (action === 'edit'){
            if (!impression || !findings) {
                return res.status(400).json({ message: 'Impression and Findings are required' });
            }

            const updatedReport = await Reports.findByIdAndUpdate(
                reportId,
                {
                    DoctorImpression : impression,
                    DoctorFindings : findings,
                    DoctorReviewDate: new Date(),
                    DoctorAction: 'Edited',
                    Status : 'Completed'
                }
            );

            if (!updatedReport) {
                return res.status(404).json({ message: 'Report not found' });
            }

            const UserEmail = await User.findById(updatedReport.UserId).select('Email');

            await sendEmail({
                to: UserEmail,
                subject: 'Report Update Notification',
                text: `Your report with ID ${reportId} has been ${action === 'edit' ? 'edited' : 'accepted'} by the doctor.`
            });
            console.log("email sent to user");
            

        }
        else if (action === 'accept') {
            const updatedReport = await Reports.findByIdAndUpdate(
                reportId,
                {   
                    DoctorReviewDate: new Date(),
                    DoctorAction: 'Accepted',
                    Status: 'Completed'
                }
            );
            
            if (!updatedReport) {
                return res.status(404).json({ message: 'Report not found' });
            }

            const UserEmail = await User.findById(updatedReport.UserId).select('Email');

            await sendEmail({
                to: UserEmail,
                subject: 'Report Update Notification',
                text: `Your report with ID ${reportId} has been ${action === 'edit' ? 'edited' : 'accepted'} by the doctor.`
            });
            console.log("email sent to user");

        }else{
            return res.status(400).json({ message: 'Invalid action' });
        }
        
        res.status(200).json({ message: 'Report updated successfully' });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getReportsByUserId(req, res) {
    try {
        const { userId } = req.params;

        console.log(`Fetching reports for user ID: ${userId}`);
        const reports = await Reports.find({ UserId: userId })
            .populate({
                path: 'DoctorId',
                select: 'FirstName LastName'
            });
        if (reports.length === 0) {
            return res.status(404).json({ message: 'No reports found for this user' });
        }

        console.log(reports)

        const formattedReports = reports.map(report => {

            let finding , impression;

            if (report.DoctorAction === 'Edited') {
                let doctorName = `${report.DoctorId.FirstName} ${report.DoctorId.LastName}`;
                finding = report.DoctorFindings;
                impression = report.DoctorImpression;
                 return {
                _id: report._id,
                UserId: report.UserId,
                DoctorId: doctorName,
                Impression: impression,
                Findings: finding,
                ReportDate: report.ReportDate,
                Status: report.Status,
                DoctorAction: report.DoctorAction,
                DoctorReviewDate: report.DoctorReviewDate
                };
            } else {
                let doctorName = `${report.DoctorId.FirstName} ${report.DoctorId.LastName}`;
                finding = report.Findings;
                impression = report.Impression;
                return {
                _id: report._id,
                UserId: report.UserId,
                DoctorId: doctorName,
                Impression: impression,
                Findings: finding,
                ReportDate: report.ReportDate,
                Status: report.Status,
                };
            }
           
        });

        console.log(formattedReports);

        res.status(200).json(formattedReports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getreportsByDoctorId(req, res) {
    try {
        const { doctorId } = req.params;

        console.log(`Fetching pending reports for doctor ID: ${doctorId}`);

        const reports = await Reports.find({ DoctorId: doctorId , Status: "Pending" })
        .populate({
            path: 'UserId',
            select: 'FirstName LastName'
        })
        .populate({
            path:'XrayImageId',
            select: 'ImageUrl'
        });

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