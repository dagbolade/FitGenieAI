// backend/src/routes/dashboardRoutes.ts
import { Router } from 'express';
import {
  getDashboardData,
  getUpcomingWorkouts,
  getRecentActivity
} from '../controllers/dashboardController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// GET dashboard data
router.get('/', getDashboardData);

// GET upcoming workouts
router.get('/workouts/upcoming', getUpcomingWorkouts);

// GET recent activity
router.get('/activity/recent', getRecentActivity);

export default router;