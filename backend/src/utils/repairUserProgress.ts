// backend/src/utils/repairUserProgress.ts
import mongoose from 'mongoose';
import UserProgress from '../models/UserProgress';
import UserWorkout from '../models/UserWorkout';
import Workout from '../models/Workout';

export const repairUserProgress = async (userId: string): Promise<void> => {
  try {
    console.log(`Repairing user progress for user: ${userId}`);

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutStats: {
          totalWorkouts: 0,
          completedWorkouts: 0,
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
    }

    // Get actual counts from database
    const totalWorkouts = await Workout.countDocuments({
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    const completedWorkouts = await UserWorkout.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    });

    // Get all completed workouts
    const userWorkouts = await UserWorkout.find({
      userId: new mongoose.Types.ObjectId(userId),
      completed: true
    });

    // Calculate total exercises
    let totalExercises = 0;
    let totalDuration = 0;
    let lastWorkoutDate = null;
    let weeklyActivity: Array<{ date: Date; duration: number }> = [];
    let exerciseCounts: Record<string, number> = {};
    let muscleGroupCounts: Record<string, number> = {};

    // Process each completed workout
    for (const workout of userWorkouts) {
      totalExercises += workout.exercises.length;
      totalDuration += workout.duration;

      // Track last workout date
      if (!lastWorkoutDate || new Date(workout.completedAt) > new Date(lastWorkoutDate)) {
        lastWorkoutDate = workout.completedAt;
      }

      // Add to weekly activity
      const workoutDate = new Date(workout.completedAt);
      workoutDate.setHours(0, 0, 0, 0);

      // Check if we already have an entry for this date
      let found = false;
      for (let i = 0; i < weeklyActivity.length; i++) {
        const activityDate = new Date(weeklyActivity[i].date);
        activityDate.setHours(0, 0, 0, 0);

        if (activityDate.getTime() === workoutDate.getTime()) {
          weeklyActivity[i].duration += workout.duration;
          found = true;
          break;
        }
      }

      if (!found) {
        weeklyActivity.push({
          date: workoutDate,
          duration: workout.duration
        });
      }

      // Track exercise counts
      for (const exercise of workout.exercises) {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;

        // Get the original workout to access muscle groups
        const originalWorkout = await Workout.findById(workout.workoutId);
        if (originalWorkout) {
          const originalExercise = originalWorkout.exercises.find(e => e.name === exercise.name);
          if (originalExercise && originalExercise.primaryMuscles) {
            for (const muscle of originalExercise.primaryMuscles) {
              muscleGroupCounts[muscle] = (muscleGroupCounts[muscle] || 0) + 1;
            }
          }
        }
      }
    }

    // Update user progress
    userProgress.workoutStats = {
      totalWorkouts,
      completedWorkouts,
      totalDuration,
      lastWorkoutDate
    };

    // Convert exercise counts to array
    const favoriteExercises = Object.entries(exerciseCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    // Convert muscle group counts to array
    const muscleGroups = Object.entries(muscleGroupCounts).map(([name, count]) => ({
      name,
      count
    }));

    userProgress.exerciseStats = {
      totalExercises,
      favoriteExercises,
      muscleGroups
    };

    userProgress.weeklyActivity = weeklyActivity;

    // Save the repaired user progress
    await userProgress.save();
    console.log(`Repaired user progress for user: ${userId}`);
  } catch (error) {
    console.error('Error repairing user progress:', error);
  }
};