import { Router } from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout
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

export default router;