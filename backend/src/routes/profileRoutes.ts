// backend/src/routes/profileRoutes.ts
import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profileController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes
router.use(authenticateUser);

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.put('/', updateUserProfile);

export default router;