// backend/src/routes/dashboardRoutes.ts
import { Router, Request, Response } from 'express'; // Add Request and Response
import {
  getDashboardData,
  getUpcomingWorkouts,
  getRecentActivity
} from '../controllers/dashboardController';
import { authenticateUser } from '../middleware/authMiddleware';
import UserProgress from "../models/UserProgress";
import mongoose from "mongoose";
import Workout from "../models/Workout";
import UserWorkout from "../models/UserWorkout";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}


const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// GET dashboard data
router.get('/', getDashboardData);

// GET upcoming workouts
router.get('/workouts/upcoming', getUpcomingWorkouts);

// GET recent activity
router.get('/activity/recent', getRecentActivity);

router.post('/repair-stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    console.log(`Repairing stats for user: ${userId}`);

    // 1. Check for completed workouts directly from UserWorkout collection
    const completedWorkouts = await UserWorkout.find({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    });

    const completedWorkoutsCount = completedWorkouts.length;
    console.log(`Found ${completedWorkoutsCount} completed workouts`);

    // 2. Count total exercises from completed workouts
    let totalExercises = 0;
    let totalDuration = 0;
    let muscleGroups: Record<string, number> = {};
    let weeklyActivity: Array<{date: Date, duration: number}> = [];

    // Process each completed workout
    for (const workout of completedWorkouts) {
      totalExercises += workout.exercises.length;
      totalDuration += workout.duration;

      // Add to weekly activity
      const workoutDate = new Date(workout.completedAt || workout.createdAt);

      // Find the original workout to get muscle group data
      const originalWorkout = await Workout.findById(workout.workoutId);
      if (originalWorkout) {
        for (const exercise of originalWorkout.exercises) {
          if (exercise.primaryMuscles && Array.isArray(exercise.primaryMuscles)) {
            for (const muscle of exercise.primaryMuscles) {
              muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
            }
          }
        }
      }

      // Add to weekly activity
      weeklyActivity.push({
        date: workoutDate,
        duration: workout.duration
      });
    }

    // Format muscle groups for storage
    const muscleGroupsArray = Object.entries(muscleGroups).map(([name, count]) => ({
      name,
      count
    }));

    // 3. Get total workouts count
    const totalWorkouts = await Workout.countDocuments({
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    console.log(`Stats summary: ${totalWorkouts} total workouts, ${completedWorkoutsCount} completed, ${totalExercises} exercises`);

    // 4. Update the UserProgress document
    const userProgress = await UserProgress.findOneAndUpdate(
      { userId },
      {
        $set: {
          'workoutStats.totalWorkouts': totalWorkouts,
          'workoutStats.completedWorkouts': completedWorkoutsCount,
          'workoutStats.totalDuration': totalDuration,
          'exerciseStats.totalExercises': totalExercises,
          'exerciseStats.muscleGroups': muscleGroupsArray,
          'weeklyActivity': weeklyActivity
        }
      },
      { new: true, upsert: true }
    );

    console.log('UserProgress updated successfully');

    res.status(200).json({
      message: 'Stats repaired successfully',
      userProgress
    });
  } catch (error) {
    console.error('Error repairing stats:', error);
    res.status(500).json({ message: 'Error repairing stats', error });
  }
});

export default router;