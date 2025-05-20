// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress';
import UserWorkout from '../models/UserWorkout';
import UserActivity from '../models/UserActivity';
import Workout from "../models/Workout";

// Format weekly activity for the dashboard
function formatWeeklyActivity(activityData: any[]): { day: string; minutes: number }[] {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = daysOfWeek.map(day => ({ day, minutes: 0 }));

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
      } else {
        activityDate = activity.date;
      }

      const dayOfWeek = activityDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Add the duration to the appropriate day
      weeklyData[dayOfWeek].minutes += activity.duration;

      console.log(`Added ${activity.duration} minutes to ${daysOfWeek[dayOfWeek]}`);
    } catch (error) {
      console.error('Error processing activity date:', error);
    }
  }

  return weeklyData;
}

// Calculate muscle group percentages for the dashboard
// Calculate muscle group percentages
function calculateMuscleGroupPercentages(muscleGroups: any[]): { name: string; percentage: number }[] {
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

    if (!userProgress) {
      console.log("No UserProgress found, creating new record");
      userProgress = new UserProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutStats: {
          totalWorkouts: totalWorkoutsCount,
          completedWorkouts: completedWorkoutsCount,
          totalDuration: 0,
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
    }

    // If we created a new record or needed to fix numbers, save it
    if (wasCreated || userProgress.isModified()) {
      await userProgress.save();
      console.log("Saved updated UserProgress record");
    }

    // Process weekly activity
    const today = new Date();
    const weeklyActivityData = userProgress.weeklyActivity || [];
    const weeklyActivity = formatWeeklyActivity(weeklyActivityData);

    console.log(`Processing ${weeklyActivityData.length} weekly activity records`);
    weeklyActivityData.forEach(activity => {
      console.log(`Activity: ${new Date(activity.date).toISOString()}, Duration: ${activity.duration}`);
    });

    // Calculate muscle group percentages
    const muscleGroups = calculateMuscleGroupPercentages(userProgress.exerciseStats.muscleGroups || []);

    // Prepare response with all the stats
    const response = {
      stats: {
        totalWorkouts: totalWorkoutsCount,
        completedWorkouts: completedWorkoutsCount,
        totalExercises: userProgress.exerciseStats.totalExercises || 0,
        favoriteExercises: (userProgress.exerciseStats.favoriteExercises || []).slice(0, 5),
        weeklyActivity: weeklyActivity,
        muscleGroups: muscleGroups
      }
    };

    console.log('Returning dashboard data:', JSON.stringify(response));
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error });
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
  } catch (error) {
    console.error('Error fetching upcoming workouts:', error);
    res.status(500).json({ message: 'Error fetching upcoming workouts', error });
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
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity', error });
  }
};