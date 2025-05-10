// backend/src/routes/aiCoachRoutes.ts
import { Router } from 'express';
import { askCoach } from '../controllers/aiCoachController';

const router = Router();

// POST ask a question to the AI coach
router.post('/', askCoach);

export default router;