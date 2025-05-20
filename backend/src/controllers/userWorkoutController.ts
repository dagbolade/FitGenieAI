// backend/src/controllers/userWorkoutController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserWorkout from '../models/UserWorkout';
import Workout from '../models/Workout';
import { recordUserActivity, updateUserProgressForCompletedWorkout } from '../utils/userProgressUtils';

// Schedule a workout for the user
export const scheduleWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workoutId, scheduled } = req.body;

    // Validate required fields
    if (!workoutId || !scheduled) {
      res.status(400).json({ message: 'Workout ID and scheduled date are required' });
      return;
    }

    // Find the workout template
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Create a user workout instance
    const userWorkout = new UserWorkout({
      userId: new mongoose.Types.ObjectId(req.user?.id),
      workoutId: new mongoose.Types.ObjectId(workoutId),
      name: workout.name,
      description: workout.description,
      scheduled: new Date(scheduled),
      completed: false,
      duration: workout.duration,
      exercises: workout.exercises.map(ex => ({
        exerciseId: new mongoose.Types.ObjectId(ex.id),
        name: ex.name,
        sets: Array(ex.sets).fill(null).map(() => ({
          reps: parseInt(ex.reps.split('-')[0]),
          weight: 0,
          completed: false
        }))
      }))
    });

    // Save the user workout
    const savedUserWorkout = await userWorkout.save();

    // Record activity
    await recordUserActivity(
      req.user?.id as string,
      'scheduled_workout',
      `Scheduled workout: ${workout.name} for ${new Date(scheduled).toLocaleDateString()}`,
        (savedUserWorkout._id as string).toString()
    );

    res.status(201).json(savedUserWorkout);
  } catch (error) {
    console.error('Error scheduling workout:', error);
    res.status(500).json({ message: 'Error scheduling workout', error });
  }
};

// Get upcoming workouts for the user
export const getUpcomingWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const currentDate = new Date();

    // Find upcoming workouts that are scheduled in the future and not completed
    const upcomingWorkouts = await UserWorkout.find({
      userId: new mongoose.Types.ObjectId(userId),
      scheduled: { $gte: currentDate },
      completed: false
    })
    .sort({ scheduled: 1 }) // Sort by date (earliest first)
    .limit(5);

    res.status(200).json(upcomingWorkouts);
  } catch (error) {
    console.error('Error fetching upcoming workouts:', error);
    res.status(500).json({ message: 'Error fetching upcoming workouts', error });
  }
};

// Get past workouts for the user
export const getPastWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const currentDate = new Date();

    // Find past workouts that are either completed or scheduled in the past
    const pastWorkouts = await UserWorkout.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { completed: true },
        { scheduled: { $lt: currentDate } }
      ]
    })
    .sort({ scheduled: -1 }) // Sort by date (most recent first)
    .limit(10);

    res.status(200).json(pastWorkouts);
  } catch (error) {
    console.error('Error fetching past workouts:', error);
    res.status(500).json({ message: 'Error fetching past workouts', error });
  }
};

// Get a specific user workout
export const getUserWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Find the user workout
    const userWorkout = await UserWorkout.findById(id);

    if (!userWorkout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (userWorkout.userId.toString() !== userId) {
      res.status(403).json({ message: 'You do not have permission to view this workout' });
      return;
    }

    res.status(200).json(userWorkout);
  } catch (error) {
    console.error('Error fetching user workout:', error);
    res.status(500).json({ message: 'Error fetching user workout', error });
  }
};

// Update workout progress (during a workout)
export const updateWorkoutProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { exercises } = req.body;
    const userId = req.user?.id;

    // Find the user workout
    const userWorkout = await UserWorkout.findById(id);

    if (!userWorkout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (userWorkout.userId.toString() !== userId) {
      res.status(403).json({ message: 'You do not have permission to update this workout' });
      return;
    }

    // Update the exercises progress
    if (exercises) {
      userWorkout.exercises = exercises;
    }

    // Save the updated workout
    const updatedWorkout = await userWorkout.save();

    res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout progress:', error);
    res.status(500).json({ message: 'Error updating workout progress', error });
  }
};

// Complete a workout
export const completeWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { exercises } = req.body;
    const userId = req.user?.id;

    // Find the user workout
    const userWorkout = await UserWorkout.findById(id);

    if (!userWorkout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (userWorkout.userId.toString() !== userId) {
      res.status(403).json({ message: 'You do not have permission to complete this workout' });
      return;
    }

    // Update the exercises if provided
    if (exercises) {
      userWorkout.exercises = exercises;
    }

    // Mark as completed
    userWorkout.completed = true;
    userWorkout.completedAt = new Date();

    // Save the completed workout
    const completedWorkout = await userWorkout.save();

    // Record activity
    await recordUserActivity(
      userId as string,
      'completed_workout',
      `Completed workout: ${userWorkout.name}`,
      id
    );

    // Update user progress
    await updateUserProgressForCompletedWorkout(
      userId as string,
      userWorkout.duration,
      userWorkout.exercises
    );

    res.status(200).json(completedWorkout);
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({ message: 'Error completing workout', error });
  }
};