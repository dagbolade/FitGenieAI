// backend/src/routes/aiCoachRoutes.ts
import { Router } from 'express';
import {
  askCoach,
  saveCoachSession,
  getPopularQuestions,
  provideFeedback
} from '../controllers/aiCoachController';

const router = Router();

// POST ask a question to the AI coach
router.post('/', askCoach);

// POST save an AI coach session
router.post('/save', saveCoachSession);

// GET popular fitness questions
router.get('/popular-questions', getPopularQuestions);

// POST provide feedback on an AI coach response
router.post('/feedback', provideFeedback);

export default router;