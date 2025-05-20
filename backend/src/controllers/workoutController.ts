// backend/src/controllers/workoutController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Workout from '../models/Workout';
import Exercise from '../models/Exercise';
import {
  recordUserActivity,
  updateUserProgressForCompletedWorkout,
  updateUserProgressForCreatedWorkout
} from '../utils/userProgressUtils';
import UserWorkout from "../models/UserWorkout";
import UserProgress from "../models/UserProgress";

// Get workouts for the current user
export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, goal, type } = req.query;

    // Build filter object with user ID
    const filter: any = {
      createdBy: req.user?.id // Only get workouts for the authenticated user
    };

    // Add other filters if provided
    if (level) filter.level = level;
    if (goal) filter.goal = goal;
    if (type) filter.type = type;

    // Get workouts from database
    const workouts = await Workout.find(filter).sort({ createdAt: -1 });

    res.status(200).json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Error fetching workouts', error });
  }
};

export const addExercisesToWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { exercises } = req.body;

    // Find the workout
    const workout = await Workout.findById(id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (workout.createdBy && workout.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You do not have permission to update this workout' });
      return;
    }

    // Add the new exercises to the workout
    if (Array.isArray(exercises) && exercises.length > 0) {
      workout.exercises = [...workout.exercises, ...exercises];

      // Save the updated workout
      const updatedWorkout = await workout.save();

      // Record activity
      await recordUserActivity(
        req.user?.id as string,
        'workout',
        `Added exercises to workout: ${workout.name}`,
        id
      );

      res.status(200).json(updatedWorkout);
    } else {
      res.status(400).json({ message: 'No valid exercises provided' });
    }
  } catch (error) {
    console.error('Error adding exercises to workout:', error);
    res.status(500).json({ message: 'Error adding exercises to workout', error });
  }
};

// Complete a workout template
export const completeWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { duration, exercisesCompleted } = req.body;

    console.log(`Completing workout ${id} for user ${req.user?.id} with duration ${duration}`);

    // Find the workout
    const workout = await Workout.findById(id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Get workout exercises for stats
    const exerciseCount = workout.exercises.length;
    console.log(`Workout has ${exerciseCount} exercises`);

    // Create a completed workout record
    const userWorkout = new UserWorkout({
      userId: new mongoose.Types.ObjectId(req.user?.id),
      workoutId: new mongoose.Types.ObjectId(id),
      name: workout.name,
      description: workout.description,
      scheduled: new Date(),
      completed: true,
      completedAt: new Date(),
      duration: duration || workout.duration,
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: Array(ex.sets).fill(null).map(() => ({
          reps: parseInt(ex.reps.split('-')[0]),
          weight: 0,
          completed: true
        }))
      }))
    });

    const savedUserWorkout = await userWorkout.save();
    console.log(`Created UserWorkout record: ${savedUserWorkout._id}`);

    // CRITICAL: Update user progress directly in the database
    console.log(`Updating UserProgress for user ${req.user?.id}`);

    // Create or update the UserProgress document using findOneAndUpdate
    const updateResult = await UserProgress.findOneAndUpdate(
      { userId: req.user?.id },
      {
        $inc: {
          'workoutStats.completedWorkouts': 1,
          'workoutStats.totalDuration': duration || workout.duration,
          'exerciseStats.totalExercises': exerciseCount
        },
        $set: {
          'workoutStats.lastWorkoutDate': new Date()
        },
        $push: {
          'weeklyActivity': {
            date: new Date(),
            duration: duration || workout.duration
          }
        }
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    );

    console.log(`UserProgress updated: ${updateResult ? 'Success' : 'Failed'}`);
    if (updateResult) {
      console.log(`New completed workout count: ${updateResult.workoutStats.completedWorkouts}`);
      console.log(`New total exercise count: ${updateResult.exerciseStats.totalExercises}`);
    }

    // Record activity
    await recordUserActivity(
      req.user?.id as string,
      'completed_workout',
      `Completed workout: ${workout.name}`,
        (savedUserWorkout._id as string).toString()
    );

    res.status(200).json({
      message: 'Workout completed successfully',
      workoutId: id,
      completedWorkoutId: savedUserWorkout._id
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({ message: 'Error completing workout', error });
  }
};
// Get a specific workout by ID
export const getWorkoutById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const workout = await Workout.findById(id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (workout.createdBy && workout.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You do not have permission to view this workout' });
      return;
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error('Error fetching workout details:', error);
    res.status(500).json({ message: 'Error fetching workout details', error });
  }
};

// Create a new workout
export const createWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workoutData = req.body;

    // Add the current user as the creator
    workoutData.createdBy = new mongoose.Types.ObjectId(req.user?.id);

    // Create new workout
    const newWorkout = new Workout(workoutData);
    const savedWorkout = await newWorkout.save();

    // Record activity
    await recordUserActivity(
      req.user?.id as string,
      'workout',
      `Created workout: ${workoutData.name}`,
        (savedWorkout._id as string).toString()
    );

    // Update user progress
    await updateUserProgressForCreatedWorkout(req.user?.id as string);

    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Error creating workout', error });
  }
};

// Generate a workout
export const generateWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, level, equipment, duration, split_type, day } = req.body;

    // Query exercises matching the criteria
    let exerciseQuery: any = {
      level: level,
      equipment: { $in: equipment }
    };

    // Filter by muscle groups based on split type and day
    if (split_type === 'ppl' && day) {
      if (day === 'push') {
        exerciseQuery.force = 'push';
      } else if (day === 'pull') {
        exerciseQuery.force = 'pull';
      } else if (day === 'legs') {
        exerciseQuery.primaryMuscles = {
          $in: ['quadriceps', 'hamstrings', 'calves', 'glutes']
        };
      }
    }

    // Find matching exercises
    let exercises = await Exercise.find(exerciseQuery).limit(50);

    // If not enough exercises found, loosen criteria
    if (exercises.length < 5) {
      // Remove equipment restriction
      delete exerciseQuery.equipment;
      exercises = await Exercise.find(exerciseQuery).limit(50);
    }

    // Determine how many exercises based on duration (approx 10 min per exercise)
    const exerciseCount = Math.max(3, Math.min(8, Math.floor(duration / 10)));

    // Separate compound and isolation exercises
    const compoundExercises = exercises.filter(ex => ex.mechanic === 'compound');
    const isolationExercises = exercises.filter(ex => ex.mechanic === 'isolation');

    // Select exercises with priority for compound movements
    const numCompound = Math.ceil(exerciseCount * 0.6); // 60% compound
    const numIsolation = exerciseCount - numCompound; // 40% isolation

    // Randomly select exercises
    const selectedCompound = compoundExercises
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numCompound, compoundExercises.length));

    const selectedIsolation = isolationExercises
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(numIsolation, isolationExercises.length));

    // If we don't have enough in either category, fill from the other
    const selectedExercises = [...selectedCompound, ...selectedIsolation]
      .sort(() => 0.5 - Math.random())
      .slice(0, exerciseCount);

    // Format exercises based on goal (sets, reps, rest)
    const formattedExercises = selectedExercises.map(ex => {
      let sets = 3;
      let reps = '10-12';
      let rest = 60;

      // Adjust based on goal
      if (goal === 'strength') {
        sets = ex.mechanic === 'compound' ? 5 : 3;
        reps = ex.mechanic === 'compound' ? '3-5' : '6-8';
        rest = ex.mechanic === 'compound' ? 180 : 120;
      } else if (goal === 'muscle building' || goal === 'hypertrophy') {
        sets = ex.mechanic === 'compound' ? 4 : 3;
        reps = '8-12';
        rest = ex.mechanic === 'compound' ? 90 : 60;
      } else if (goal === 'fat loss') {
        sets = 3;
        reps = '12-15';
        rest = 45;
      } else if (goal === 'endurance') {
        sets = 3;
        reps = '15-20';
        rest = 30;
      }

      return {
        id: ex._id,
        name: ex.name,
        sets: sets,
        reps: reps,
        rest_seconds: rest,
        equipment: ex.equipment,
        primaryMuscles: ex.primaryMuscles,
        secondaryMuscles: ex.secondaryMuscles,
        instructions: ex.instructions,
        images: ex.images
      };
    });

    // Create workout name and description
    let workoutName = '';
    let workoutDescription = '';

    if (split_type === 'ppl' && day) {
      workoutName = `${day.charAt(0).toUpperCase() + day.slice(1)} Day for ${goal.charAt(0).toUpperCase() + goal.slice(1)}`;

      if (day === 'push') {
        workoutDescription = 'Focus on chest, shoulders, and triceps with movements that involve pushing weight away from your body.';
      } else if (day === 'pull') {
        workoutDescription = 'Focus on back and biceps with movements that involve pulling weight toward your body.';
      } else if (day === 'legs') {
        workoutDescription = 'Focus on quadriceps, hamstrings, glutes, and calves to build lower body strength and power.';
      }
    } else {
      workoutName = `${split_type.charAt(0).toUpperCase() + split_type.slice(1)} Workout for ${goal.charAt(0).toUpperCase() + goal.slice(1)}`;
      workoutDescription = `A ${split_type} workout designed to help you achieve your ${goal} goals.`;
    }

    // Create the workout with the current user as creator
    const newWorkout = new Workout({
      name: workoutName,
      description: workoutDescription,
      goal: goal,
      level: level,
      type: day || split_type,
      duration: duration,
      exercises: formattedExercises,
      createdBy: new mongoose.Types.ObjectId(req.user?.id)
    });

    // Save to database
    const savedWorkout = await newWorkout.save();

    // Record activity
    await recordUserActivity(
      req.user?.id as string,
      'workout',
      `Generated workout: ${workoutName}`,
        (savedWorkout._id as string).toString()
    );

    // Update user progress
    await updateUserProgressForCreatedWorkout(req.user?.id as string);

    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error('Error generating workout:', error);
    res.status(500).json({ message: 'Error generating workout', error });
  }
};

// Update a workout
export const updateWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the workout
    const workout = await Workout.findById(id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (workout.createdBy && workout.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You do not have permission to update this workout' });
      return;
    }

    // Update the workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Record activity
    await recordUserActivity(
      req.user?.id as string,
      'workout',
      `Updated workout: ${workout.name}`,
      id
    );

    res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Error updating workout', error });
  }
};

// Delete a workout
export const deleteWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the workout
    const workout = await Workout.findById(id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Check if the workout belongs to the current user
    if (workout.createdBy && workout.createdBy.toString() !== req.user?.id) {
      res.status(403).json({ message: 'You do not have permission to delete this workout' });
      return;
    }

    // Delete the workout
    await Workout.findByIdAndDelete(id);

    // Record activity
    await recordUserActivity(
      req.user?.id as string,
      'workout',
      `Deleted workout: ${workout.name}`,
      id
    );

    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Error deleting workout', error });
  }
};