// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import userWorkoutRoutes from './routes/userWorkoutRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { authenticateUser } from './middleware/authMiddleware';
import aiCoachRoutes from "./routes/aiCoachRoutes";
import profileRoutes from './routes/profileRoutes';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['https://fitgenieai.netlify.app/', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes); // Exercise library is public

// Protected routes
app.use('/api/workouts', authenticateUser, workoutRoutes);
app.use('/api/user-workouts', authenticateUser, userWorkoutRoutes);
app.use('/api/dashboard', authenticateUser, dashboardRoutes);
app.use('/api/ai-coach', authenticateUser, aiCoachRoutes); // AI Coach routes
app.use('/api/profile', authenticateUser, profileRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'FitGenieAI API is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });