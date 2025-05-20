// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress';
import UserWorkout from '../models/UserWorkout';
import UserActivity from '../models/UserActivity';
import Workout from "../models/Workout";

// Define interfaces for better type safety
interface WeeklyActivity {
  date: Date;
  duration: number;
  calories?: number; // Make calories optional for backward compatibility
}

interface FormattedActivity {
  day: string;
  minutes: number;
  calories: number;
}

interface MuscleGroup {
  name: string;
  count: number;
}

interface FormattedMuscleGroup {
  name: string;
  percentage: number;
}

// Format weekly activity for the dashboard
function formatWeeklyActivity(activityData: WeeklyActivity[]): FormattedActivity[] {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData: FormattedActivity[] = daysOfWeek.map(day => ({
    day,
    minutes: 0,
    calories: 0
  }));

  if (!activityData || activityData.length === 0) {
    console.log('No weekly activity data found');
    return weeklyData;
  }

  console.log(`Processing ${activityData.length} weekly activity entries`);

  // Process each activity entry
  for (const activity of activityData) {
    try {
      let activityDate: Date;

      // Handle string dates or Date objects
      if (typeof activity.date === 'string') {
        activityDate = new Date(activity.date);
      } else if (activity.date instanceof Date) {
        activityDate = activity.date;
      } else {
        console.error('Invalid date format:', activity.date);
        continue; // Skip this activity if date is invalid
      }

      if (isNaN(activityDate.getTime())) {
        console.error('Invalid date value:', activity.date);
        continue; // Skip if date is invalid
      }

      const dayOfWeek = activityDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Add the duration to the appropriate day - ensure it's a number
      const duration = typeof activity.duration === 'number' ? activity.duration : 0;
      weeklyData[dayOfWeek].minutes += duration;

      // Add calories if available - ensure it's a number
      if (typeof activity.calories === 'number') {
        weeklyData[dayOfWeek].calories += activity.calories;
        console.log(`Added ${activity.calories} calories to ${daysOfWeek[dayOfWeek]}`);
      }

      console.log(`Added ${duration} minutes to ${daysOfWeek[dayOfWeek]}`);
    } catch (error: any) {
      console.error('Error processing activity date:', error.message);
    }
  }

  return weeklyData;
}

// Calculate muscle group percentages for the dashboard
function calculateMuscleGroupPercentages(muscleGroups: MuscleGroup[]): FormattedMuscleGroup[] {
  if (!muscleGroups || muscleGroups.length === 0) {
    return [];
  }

  // Calculate total exercises across all muscle groups
  const totalExercises = muscleGroups.reduce((sum, group) => sum + group.count, 0);

  if (totalExercises === 0) {
    return [];
  }

  // Calculate percentage for each muscle group
  return muscleGroups.map(group => ({
    name: group.name,
    percentage: Math.round((group.count / totalExercises) * 100)
  })).sort((a, b) => b.percentage - a.percentage); // Sort by percentage (highest first)
}

// Get dashboard data for the authenticated user
export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    console.log(`Getting dashboard data for user: ${userId}`);

    // Count workouts directly
    const totalWorkoutsCount = await Workout.countDocuments({
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    // Count completed workouts directly
    const completedWorkoutsCount = await UserWorkout.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    });

    console.log(`Direct counts - Total: ${totalWorkoutsCount}, Completed: ${completedWorkoutsCount}`);

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });
    let wasCreated = false;

    // Calculate total calories burned from completed workouts
    const caloriesResults = await UserWorkout.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completed: true
        }
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$caloriesBurned" }
        }
      }
    ]);

    const totalCaloriesBurned = caloriesResults.length > 0 ?
      (caloriesResults[0].totalCalories || 0) : 0;

    console.log(`Total calories burned from workouts: ${totalCaloriesBurned}`);

    if (!userProgress) {
      console.log("No UserProgress found, creating new record");
      userProgress = new UserProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutStats: {
          totalWorkouts: totalWorkoutsCount,
          completedWorkouts: completedWorkoutsCount,
          totalDuration: 0,
          totalCaloriesBurned: totalCaloriesBurned,
          lastWorkoutDate: null
        },
        exerciseStats: {
          totalExercises: 0,
          favoriteExercises: [],
          muscleGroups: []
        },
        weeklyActivity: []
      });
      wasCreated = true;
    } else {
      // Ensure stats are consistent with database
      if (userProgress.workoutStats.completedWorkouts !== completedWorkoutsCount) {
        console.log(`Fixing completedWorkouts count: ${userProgress.workoutStats.completedWorkouts} -> ${completedWorkoutsCount}`);
        userProgress.workoutStats.completedWorkouts = completedWorkoutsCount;
      }

      // Update calories burned if needed
      const currentCalories = userProgress.workoutStats.totalCaloriesBurned || 0;
      if (currentCalories !== totalCaloriesBurned) {
        console.log(`Updating totalCaloriesBurned: ${currentCalories} -> ${totalCaloriesBurned}`);
        userProgress.workoutStats.totalCaloriesBurned = totalCaloriesBurned;
      }
    }

    // If we created a new record or needed to fix numbers, save it
    if (wasCreated || userProgress.isModified()) {
      await userProgress.save();
      console.log("Saved updated UserProgress record");
    }

    // Process weekly activity
    const weeklyActivityData = userProgress.weeklyActivity || [];
    const weeklyActivity = formatWeeklyActivity(weeklyActivityData as WeeklyActivity[]);

    console.log(`Processing ${weeklyActivityData.length} weekly activity records`);
    weeklyActivityData.forEach(activity => {
      const activityDate = activity.date ? new Date(activity.date).toISOString() : 'unknown date';
      console.log(`Activity: ${activityDate}, Duration: ${activity.duration}, Calories: ${activity.calories || 0}`);
    });

    // Calculate muscle group percentages
    const muscleGroups = calculateMuscleGroupPercentages(userProgress.exerciseStats.muscleGroups || []);

    // Prepare response with all the stats
    const response = {
      stats: {
        totalWorkouts: totalWorkoutsCount,
        completedWorkouts: completedWorkoutsCount,
        totalExercises: userProgress.exerciseStats.totalExercises || 0,
        totalCaloriesBurned: totalCaloriesBurned, // Add calories to response
        favoriteExercises: (userProgress.exerciseStats.favoriteExercises || []).slice(0, 5),
        weeklyActivity: weeklyActivity,
        muscleGroups: muscleGroups
      }
    };

    console.log('Returning dashboard data:', JSON.stringify(response));
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// Get upcoming workouts for the authenticated user
export const getUpcomingWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const currentDate = new Date();

    // Find upcoming workouts that are scheduled in the future and not completed
    const upcomingWorkouts = await UserWorkout.find({
      userId: new mongoose.Types.ObjectId(userId),
      scheduled: { $gte: currentDate },
      completed: false
    })
    .sort({ scheduled: 1 }) // Sort by date (earliest first)
    .limit(5);

    // Format the workouts for the frontend
    const formattedWorkouts = upcomingWorkouts.map(workout => ({
      _id: workout._id,
      name: workout.name,
      date: workout.scheduled,
      duration: workout.duration,
      completed: workout.completed
    }));

    res.status(200).json(formattedWorkouts);
  } catch (error: any) {
    console.error('Error fetching upcoming workouts:', error);
    res.status(500).json({ message: 'Error fetching upcoming workouts', error: error.message });
  }
};

// Get recent activity for the authenticated user
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get recent activities
    const activities = await UserActivity.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
    .sort({ createdAt: -1 })
    .limit(10);

    // Format for frontend
    const recentActivity = activities.map(activity => ({
      type: activity.type,
      title: activity.title,
      date: activity.createdAt,
      id: activity.referenceId
    }));

    res.status(200).json(recentActivity);
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
};

// Add an endpoint to repair user progress stats if needed
export const repairUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get accurate counts directly from database
    const totalWorkoutsCount = await Workout.countDocuments({
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    const completedWorkoutsCount = await UserWorkout.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    });

    // Calculate total duration and calories from all completed workouts
    const workoutStats = await UserWorkout.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completed: true
        }
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$duration" },
          totalCalories: { $sum: "$caloriesBurned" }
        }
      }
    ]);

    const totalDuration = workoutStats.length > 0 ? workoutStats[0].totalDuration : 0;
    const totalCaloriesBurned = workoutStats.length > 0 ? workoutStats[0].totalCalories : 0;

    // Get the latest workout date
    const latestWorkout = await UserWorkout.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    }).sort({ completedAt: -1 });

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutStats: {
          totalWorkouts: totalWorkoutsCount,
          completedWorkouts: completedWorkoutsCount,
          totalDuration: totalDuration,
          totalCaloriesBurned: totalCaloriesBurned,
          lastWorkoutDate: latestWorkout?.completedAt || null // Use optional chaining
        },
        exerciseStats: {
          totalExercises: 0,
          favoriteExercises: [],
          muscleGroups: []
        },
        weeklyActivity: []
      });
    } else {
      // Update with accurate counts
      userProgress.workoutStats.totalWorkouts = totalWorkoutsCount;
      userProgress.workoutStats.completedWorkouts = completedWorkoutsCount;
      userProgress.workoutStats.totalDuration = totalDuration;
      userProgress.workoutStats.totalCaloriesBurned = totalCaloriesBurned;

      // Safely assign completedAt date if it exists
      if (latestWorkout && latestWorkout.completedAt) {
        userProgress.workoutStats.lastWorkoutDate = latestWorkout.completedAt;
      }
    }

    // Save the updated progress
    await userProgress.save();

    res.status(200).json({
      message: 'User stats repaired successfully',
      stats: userProgress.workoutStats
    });

  } catch (error: any) {
    console.error('Error repairing user stats:', error);
    res.status(500).json({ message: 'Error repairing user stats', error: error.message });
  }
};