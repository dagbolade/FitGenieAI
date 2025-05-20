import mongoose from 'mongoose';
import UserActivity from '../models/UserActivity';
import UserProgress from '../models/UserProgress';

// Record a user activity
export const recordUserActivity = async (
  userId: string,
  type: string,
  title: string,
  referenceId: string
): Promise<void> => {
  try {
    const activity = new UserActivity({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      referenceId,
      createdAt: new Date()
    });

    await activity.save();
  } catch (error) {
    console.error('Error recording user activity:', error);
  }
};

// Update user progress for a completed workout
export const updateUserProgressForCompletedWorkout = async (
  userId: string,
  duration: number,
  exercises: any[]
): Promise<void> => {
  try {
    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutStats: {
          totalWorkouts: 0,
          completedWorkouts: 0,
          totalDuration: 0
        },
        exerciseStats: {
          totalExercises: 0,
          favoriteExercises: [],
          muscleGroups: []
        },
        weeklyActivity: []
      });
    }

    // Update workout stats
    userProgress.workoutStats.completedWorkouts += 1;
    userProgress.workoutStats.totalDuration += duration;
    userProgress.workoutStats.lastWorkoutDate = new Date();

    // Add to weekly activity
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // Check if we already have an entry for today
    const todayIndex = userProgress.weeklyActivity.findIndex(
      activity => {
        const activityDate = new Date(activity.date);
        return (
          activityDate.getDate() === today.getDate() &&
          activityDate.getMonth() === today.getMonth() &&
          activityDate.getFullYear() === today.getFullYear()
        );
      }
    );

    if (todayIndex >= 0) {
      // Update existing entry
      userProgress.weeklyActivity[todayIndex].duration += duration;
    } else {
      // Add new entry
      userProgress.weeklyActivity.push({ date: today, duration });
    }

    // Update exercise stats
    userProgress.exerciseStats.totalExercises += exercises.length;

    // Update favorite exercises
    for (const exercise of exercises) {
      const exerciseName = exercise.name;

      // Find if exercise already exists in favorites
      const favoriteIndex = userProgress.exerciseStats.favoriteExercises.findIndex(
        fav => fav.name === exerciseName
      );

      if (favoriteIndex >= 0) {
        // Update existing favorite
        userProgress.exerciseStats.favoriteExercises[favoriteIndex].count += 1;
      } else {
        // Add new favorite
        userProgress.exerciseStats.favoriteExercises.push({
          name: exerciseName,
          count: 1
        });
      }

      // Update muscle groups
      if (exercise.primaryMuscles && exercise.primaryMuscles.length > 0) {
        for (const muscle of exercise.primaryMuscles) {
          // Find if muscle group already exists
          const muscleIndex = userProgress.exerciseStats.muscleGroups.findIndex(
            m => m.name === muscle
          );

          if (muscleIndex >= 0) {
            // Update existing muscle group
            userProgress.exerciseStats.muscleGroups[muscleIndex].count += 1;
          } else {
            // Add new muscle group
            userProgress.exerciseStats.muscleGroups.push({
              name: muscle,
              count: 1
            });
          }
        }
      }
    }

    // Sort favorite exercises by count (descending)
    userProgress.exerciseStats.favoriteExercises.sort((a, b) => b.count - a.count);

    // Keep only top 10 favorite exercises
    if (userProgress.exerciseStats.favoriteExercises.length > 10) {
      userProgress.exerciseStats.favoriteExercises = userProgress.exerciseStats.favoriteExercises.slice(0, 10);
    }

    // Clean up old weekly activity data (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    userProgress.weeklyActivity = userProgress.weeklyActivity.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thirtyDaysAgo;
    });

    // Save updated progress
    await userProgress.save();
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
};

// Update user progress when a workout is created
export const updateUserProgressForCreatedWorkout = async (
  userId: string
): Promise<void> => {
  try {
    // Find or create user progress
    let userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      userProgress = new UserProgress({
        userId: new mongoose.Types.ObjectId(userId),
        workoutStats: {
          totalWorkouts: 0,
          completedWorkouts: 0,
          totalDuration: 0
        },
        exerciseStats: {
          totalExercises: 0,
          favoriteExercises: [],
          muscleGroups: []
        },
        weeklyActivity: []
      });
    }

    // Increment total workouts
    userProgress.workoutStats.totalWorkouts += 1;

    // Update exercise stats
    userProgress.exerciseStats.totalExercises += 1; // No exercises added at creation

    // Save updated progress
    await userProgress.save();
  } catch (error) {
    console.error('Error updating user progress for created workout:', error);
  }
};