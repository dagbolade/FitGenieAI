// backend/src/routes/workoutRoutes.ts
import { Router } from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  generateWorkout
} from '../controllers/workoutController';

const router = Router();

// GET all workouts with optional filters
router.get('/', getWorkouts);

// GET a specific workout
router.get('/:id', getWorkoutById);

// POST a new workout
router.post('/', createWorkout);

// PUT update a workout
router.put('/:id', updateWorkout);

// DELETE a workout
router.delete('/:id', deleteWorkout);

// POST generate a workout
router.post('/generate', generateWorkout);

export default router;