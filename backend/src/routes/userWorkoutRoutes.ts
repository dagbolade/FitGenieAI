// backend/src/routes/userWorkoutRoutes.ts
import { Router } from 'express';
import {
  scheduleWorkout,
  getUpcomingWorkouts,
  getPastWorkouts,
  getUserWorkout,
  updateWorkoutProgress,
  completeWorkout
} from '../controllers/userWorkoutController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// Schedule a workout
router.post('/', scheduleWorkout);

// Get upcoming workouts
router.get('/upcoming', getUpcomingWorkouts);

// Get past workouts
router.get('/past', getPastWorkouts);

// Get a specific user workout
router.get('/:id', getUserWorkout);

// Update workout progress
router.put('/:id/progress', updateWorkoutProgress);

// Complete a workout
router.put('/:id/complete', completeWorkout);

export default router;