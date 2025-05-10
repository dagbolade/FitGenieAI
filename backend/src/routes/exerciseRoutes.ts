// backend/src/routes/exerciseRoutes.ts
import { Router } from 'express';
import {
  getExercises,
  getExerciseById,
  getEquipmentTypes,
  getMuscleGroups
} from '../controllers/exerciseController';

const router = Router();

// GET all exercises with optional filters
router.get('/', getExercises);

// GET available equipment types - MOVE THIS BEFORE THE :id ROUTE
router.get('/equipment/types', getEquipmentTypes);

// GET available muscle groups - MOVE THIS BEFORE THE :id ROUTE
router.get('/muscle/groups', getMuscleGroups);

// GET a specific exercise - MOVE THIS AFTER THE SPECIFIC ROUTES
router.get('/:id', getExerciseById);

export default router;