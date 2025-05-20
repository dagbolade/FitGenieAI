// backend/src/routes/workoutRoutes.ts
import { Router, Request, Response } from 'express'; // Add the Request and Response types
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  generateWorkout,
  addExercisesToWorkout,
  completeWorkout
} from '../controllers/workoutController';
import { authenticateUser } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import Workout from '../models/Workout';
import UserWorkout from '../models/UserWorkout';
import { updateUserProgressForCompletedWorkout, recordUserActivity } from '../utils/userProgressUtils';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// GET all workouts with optional filters
router.get('/', getWorkouts);

// GET a specific workout
router.get('/:id', getWorkoutById);

// POST create a new workout
router.post('/', createWorkout);

// POST generate a workout
router.post('/generate', generateWorkout);

// PUT update a workout
router.put('/:id', updateWorkout);

// POST add exercises to a workout
router.post('/:id/exercises', addExercisesToWorkout);

// POST complete a workout
router.post('/:id/complete', completeWorkout);

// DELETE a workout
router.delete('/:id', authenticateUser, deleteWorkout);



router.post('/simple-test', (req, res) => {
  console.log('Simple test endpoint hit');
  res.json({ success: true, message: 'Simple test successful' });
});



export default router;