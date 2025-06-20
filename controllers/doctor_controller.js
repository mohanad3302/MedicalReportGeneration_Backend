const Doctor = require('../schemas/doctor_schema');
const Reports = require('../schemas/reports_schema');

const getDoctorData = async (req, res) => {
    try {
        const { doctorId } = req.params;

        console.log(`Fetching data for doctor ID: ${doctorId}`);
        
        const doctor = await Doctor.findById(doctorId).select('-Password'); // Exclude password from response

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getDoctorReportStatsSummary(req, res) {
    const { doctorId } = req.params;

    console.log(`Fetching report stats for doctor ID: ${doctorId}`);

    try {
        const pendingCount = await Reports.countDocuments({ DoctorId: doctorId, Status: 'Pending' });
        const editedCount = await Reports.countDocuments({ DoctorId: doctorId, DoctorAction: 'Edited' });
        const acceptedCount = await Reports.countDocuments({ DoctorId: doctorId, DoctorAction: 'Accepted' });

        const analyzedCount = editedCount + acceptedCount;
        res.json({
            pending: pendingCount,
            analyzed: analyzedCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getDoctorWeeklyStatus (req, res) {
    try {
        const {doctorId } = req.params;

        console.log(`Fetching report weekly stats for doctor ID: ${doctorId}`);
        // Get the earliest review date for this doctor
        const earliest = await Reports.findOne({ DoctorId: doctorId, DoctorReviewDate: { $ne: null } })
            .sort({ DoctorReviewDate: 1 })
            .select('DoctorReviewDate')
            .lean();

        if (!earliest) {
            return res.json({
                labels: [],
                datasets: [
                    {
                        label: "Accepted",
                        data: [],
                        borderColor: "#c7973c",
                        backgroundColor: "rgba(199,151,60,0.3)",
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: "Edited",
                        data: [],
                        borderColor: "#7c6236",
                        backgroundColor: "rgba(124,98,54,0.3)",
                        fill: true,
                        tension: 0.3,
                    }
                ]
            });
        }

        const startDate = new Date(earliest.DoctorReviewDate);

        // Aggregation pipeline
        const stats = await Reports.aggregate([
            { $match: { DoctorId: doctorId, DoctorReviewDate: { $ne: null } } },
            {
                $addFields: {
                    week: {
                        $floor: {
                            $divide: [
                                { $subtract: [ { $toDate: "$DoctorReviewDate" }, startDate ] },
                                1000 * 60 * 60 * 24 * 7 // ms in a week
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { week: "$week", action: "$DoctorAction" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Find the number of weeks
        const weekNumbers = stats.map(s => s._id.week);
        const maxWeek = weekNumbers.length ? Math.max(...weekNumbers) : 0;
        const labels = Array.from({ length: maxWeek + 1 }, (_, i) => `Week ${i + 1}`);

        // Prepare datasets
        const acceptedData = Array(maxWeek + 1).fill(0);
        const editedData = Array(maxWeek + 1).fill(0);

        stats.forEach(s => {
            if (s._id.action === 'Accepted') acceptedData[s._id.week] = s.count;
            if (s._id.action === 'Edited') editedData[s._id.week] = s.count;
        });

        res.json({
            labels,
            datasets: [
                {
                    label: "Accepted",
                    data: acceptedData,
                    borderColor: "#c7973c",
                    backgroundColor: "rgba(199,151,60,0.3)",
                    fill: true,
                    tension: 0.3,
                },
                {
                    label: "Edited",
                    data: editedData,
                    borderColor: "#7c6236",
                    backgroundColor: "rgba(124,98,54,0.3)",
                    fill: true,
                    tension: 0.3,
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

async function getDoctorWithLeastReports(){
    try {
        const doctors = await Doctor.find().select('_id Email FirstName LastName');
        
        if (!doctors || doctors.length === 0) {
            return null;
        }

        const reportCounts = await Reports.aggregate([
            { $match: { DoctorId: { $in: doctors.map(d => d._id) } } },
            { $group: { _id: '$DoctorId', count: { $sum: 1 } } }
        ]);

        const reportCountMap = reportCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        let leastReportsDoctor = null;
        let leastReportsCount = Infinity;

        for (const doctor of doctors) {
            const count = reportCountMap[doctor._id] || 0;
            if (count < leastReportsCount) {
                leastReportsCount = count;
                leastReportsDoctor = doctor;
            }
        }

        return leastReportsDoctor;

    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    getDoctorData,
    getDoctorReportStatsSummary,
    getDoctorWeeklyStatus,
    getDoctorWithLeastReports
};