const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');

dotenv.config();

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

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
