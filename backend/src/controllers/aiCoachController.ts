// backend/src/controllers/aiCoachController.ts
import { Request, Response } from 'express';
import { generateAIResponse } from '../utils/gemini';
import { findRelevantExercises } from '../utils/exerciseUtils';
import { recordUserActivity } from '../utils/userProgressUtils';
import mongoose from 'mongoose';

/**
 * AI Coach endpoint - processes user fitness questions and returns both
 * an AI-generated response and relevant exercises from the database
 */
export const askCoach = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, user_profile, userId } = req.body;

    if (!query) {
      res.status(400).json({ message: 'Query is required' });
      return;
    }

    console.log('Processing query:', query);

    // Get relevant exercises based on the query
    const relevantExercises = await findRelevantExercises(query, 5);
    console.log(`Found ${relevantExercises.length} relevant exercises`);

    // Log the first exercise to see structure
    if (relevantExercises.length > 0) {
      console.log('Sample exercise:', JSON.stringify(relevantExercises[0], null, 2));
    }

    // Generate AI response using the Gemini API or fallback
    const response = await generateAIResponse(query, relevantExercises);

    // Record the activity if userId is provided
    let conversationId = new mongoose.Types.ObjectId().toString();
    if (userId) {
      console.log(`Recording activity for user: ${userId}`);
      try {
        await recordUserActivity(
          userId,
          'ai_coach',
          `Asked about: ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`,
          conversationId
        );
      } catch (activityError) {
        // Log error but don't fail the request
        console.error('Error recording activity:', activityError);
      }
    }

    // Return both the AI response and the relevant exercises
    res.status(200).json({
      response,
      relevant_exercises: relevantExercises,
      conversation_id: conversationId
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      message: 'Error processing query',
      error,
      response: "I'm sorry, I couldn't process your request at this time. Please try again later.",
      relevant_exercises: []
    });
  }
};

/**
 * This endpoint allows the user to save an AI Coach session for future reference
 */
export const saveCoachSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, response, exercises, userId } = req.body;

    if (!query || !response) {
      res.status(400).json({ message: 'Query and response are required' });
      return;
    }

    // Here you would normally save the session to your database
    // For now, just return success
    res.status(200).json({
      message: 'Session saved successfully',
      sessionId: 'session_' + Date.now()
    });
  } catch (error) {
    console.error('Error saving coach session:', error);
    res.status(500).json({
      message: 'Error saving coach session',
      error
    });
  }
};

/**
 * This endpoint returns a list of popular fitness questions
 * that users can ask the AI Coach
 */
export const getPopularQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    // These could eventually come from a database of popular questions
    const popularQuestions = [
      {
        id: 1,
        question: "What are the best exercises for building chest muscles?",
        category: "muscle building"
      },
      {
        id: 2,
        question: "How many days per week should I work out?",
        category: "general fitness"
      },
      {
        id: 3,
        question: "What exercises can I do with just dumbbells?",
        category: "home workout"
      },
      {
        id: 4,
        question: "How can I improve my squat form?",
        category: "technique"
      },
      {
        id: 5,
        question: "What should I eat before and after a workout?",
        category: "nutrition"
      }
    ];

    res.status(200).json(popularQuestions);
  } catch (error) {
    console.error('Error fetching popular questions:', error);
    res.status(500).json({
      message: 'Error fetching popular questions',
      error
    });
  }
};

/**
 * This endpoint allows feedback on AI Coach responses
 * to help improve the system over time
 */
export const provideFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, rating, feedback } = req.body;

    if (!sessionId || !rating) {
      res.status(400).json({ message: 'Session ID and rating are required' });
      return;
    }

    // Here you would normally save feedback to your database
    // For now, just return success
    res.status(200).json({
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      message: 'Error recording feedback',
      error
    });
  }
};