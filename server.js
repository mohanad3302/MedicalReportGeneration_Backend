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

const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'xray_uploads', // or any folder name you want in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => Date.now() + '-' + file.originalname,
  },
});

const upload = multer({dest:'temp_uploads/'});

// { storage : storage }

const app = express();
const PORT = process.env.PORT

app.use(express.json());
app.use(cors());


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
