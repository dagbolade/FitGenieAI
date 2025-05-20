// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user (protected route)
router.get('/me', authenticateUser, getCurrentUser);

export default router;