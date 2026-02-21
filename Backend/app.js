const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const formRouts = require('./routes/formRoutes');
const classRoomRoutes = require('./routes/classRoomRoutes')
const notificationRoutes = require('./routes/notificationRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const finalFormRoutes = require('./routes/finalFormRoutes');
const ClassRoutes = require('./routes/ClassRoutes');
const Weekly4Routes = require('./routes/Weekly4Routes');
const activityRoutes = require('./routes/activityRoutes');
const wingCoordinatorRoutes = require('./routes/wingCoordinatorRoutes');
require('dotenv').config();
const cors = require('cors')
const app = express();
app.use(cors({
    origin: "",
    //  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    headers: ["Content-Type", 'Authorization'],
    // credentials: true,
}));




// app.use(cors())

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter)
app.use('/api/form', formRouts)
app.use('/api/notification', notificationRoutes)
app.use('/api/classroom-walkthrough', classRoomRoutes)
app.use('/api/notebook-checking-proforma', notebookRoutes)
app.use('/api/wing-coordinator', finalFormRoutes)
app.use('/api/class', ClassRoutes)
app.use('/api', Weekly4Routes);
app.use('/api/activity', activityRoutes);
app.use('/api/wing-coordinator', wingCoordinatorRoutes)

module.exports = app;
