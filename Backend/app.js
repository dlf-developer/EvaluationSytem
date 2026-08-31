const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
const envPath = path.resolve(__dirname, envFile);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // fallback to standard .env
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { initProcessMonitor } = require('./utils/processMonitor');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Initialize process monitoring & crash trap
initProcessMonitor();

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const formRouts = require('./routes/formRoutes');
const classRoomRoutes = require('./routes/classRoomRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notebookRoutes = require('./routes/notebookRoutes');
const finalFormRoutes = require('./routes/finalFormRoutes');
const ClassRoutes = require('./routes/ClassRoutes');
const Weekly4Routes = require('./routes/Weekly4Routes');
const activityRoutes = require('./routes/activityRoutes');
const wingCoordinatorRoutes = require('./routes/wingCoordinatorRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const coScholasticRoutes = require('./routes/coScholasticRoutes');
const accountabilityRoutes = require('./routes/accountabilityRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request Logger (Captures every request & response to backend.log & error.log)
app.use(requestLogger);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/form', formRouts);
app.use('/api/notification', notificationRoutes);
app.use('/api/classroom-walkthrough', classRoomRoutes);
app.use('/api/notebook-checking-proforma', notebookRoutes);
app.use('/api/wing-coordinator', finalFormRoutes);
app.use('/api/class', ClassRoutes);
app.use('/api', Weekly4Routes);
app.use('/api/activity', activityRoutes);
app.use('/api/wing-coordinator', wingCoordinatorRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/co-scholastic', coScholasticRoutes);
app.use('/api/accountability', accountabilityRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (req, res) => {
    return res.json({ message: "hello" });
});

// Global Error Handler Middleware (Captures all uncaught route errors)
app.use(errorHandler);

module.exports = app;

