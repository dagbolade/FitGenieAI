// backend/src/controllers/aiCoachController.ts
import { Request, Response } from 'express';
import Exercise from '../models/Exercise';
import { getSimilarExercises } from '../utils/exerciseUtils';
import { generateAIResponse } from '../utils/openai';

// AI Coach endpoint
export const askCoach = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, user_profile } = req.body;

    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    // Get relevant exercises using our RAG approach
    const relevantExercises = await getSimilarExercises(query, 5);

    // Generate response using OpenAI
    const response = await generateAIResponse(query, relevantExercises);

    res.status(200).json({
      response,
      relevant_exercises: relevantExercises
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ message: 'Error processing query', error });
  }
};