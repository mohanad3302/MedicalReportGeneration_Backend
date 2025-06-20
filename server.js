const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


const authRoutes = require('./routes/auth_routes');
const modelRoutes = require('./routes/model_routes');
const reportRoutes = require('./routes/reports_routes');
const userRoutes = require('./routes/user_routes');
const doctorRoutes = require('./routes/doctor_routes'); // Assuming you have a doctor routes file

const upload = multer({ dest: 'uploads/' });


dotenv.config();


const app = express();
const PORT = process.env.PORT

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MongoDB_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
})
.then(() => console.log('MongoDB connected'))
.catch( err => console.log('Error connecting to MongoDB : ' , err))


app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/model', upload.single('file'), modelRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/doctors', doctorRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
