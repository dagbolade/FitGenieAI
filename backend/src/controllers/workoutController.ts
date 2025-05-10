// backend/src/controllers/workoutController.ts
import { Request, Response } from 'express';
import Workout, { IWorkout } from '../models/Workout';
import Exercise from '../models/Exercise'; // We'll use this to get exercise details when generating workouts

interface ExerciseDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  equipment: string;
  primaryMuscles: string[];
  instructions: string[];
  mechanic?: string;
  secondaryMuscles?: string[];
  images?: string[];
}

// Get all workouts
export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, goal, type } = req.query;

    // Build filter object
    const filter: any = {};
    if (level) filter.level = level;
    if (goal) filter.goal = goal;
    if (type) filter.type = type;

    const workouts = await Workout.find(filter);
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error });
  }
};

// Get workout by ID
export const getWorkoutById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workout', error });
  }
};

// Create a new workout
export const createWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workoutData = req.body;
    const newWorkout = new Workout(workoutData);
    const savedWorkout = await newWorkout.save();

    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(500).json({ message: 'Error creating workout', error });
  }
};

// Update a workout
export const updateWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedWorkout = await Workout.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedWorkout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    res.status(200).json(updatedWorkout);
  } catch (error) {
    res.status(500).json({ message: 'Error updating workout', error });
  }
};

// Delete a workout
export const deleteWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedWorkout = await Workout.findByIdAndDelete(id);

    if (!deletedWorkout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workout', error });
  }
};


import mongoose from "mongoose";

// Add exercises to a user's workout
export const addExercisesToWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workoutId, exerciseIds } = req.body;

    if (!workoutId || !exerciseIds || !Array.isArray(exerciseIds)) {
      res.status(400).json({ message: 'Workout ID and exercise IDs are required' });
      return;
    }

    // Find the workout
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Find all the exercises with explicit typing
    const exercises = await Exercise.find({ _id: { $in: exerciseIds } }) as (ExerciseDocument & { _id: mongoose.Types.ObjectId })[];

    if (exercises.length === 0) {
      res.status(404).json({ message: 'No valid exercises found' });
      return;
    }

    // Format exercises for the workout with proper typing
    const formattedExercises = exercises.map(ex => ({
      id: ex._id.toString(), // Now TypeScript knows _id exists and has toString()
      name: ex.name,
      sets: 3, // Default values
      reps: '10-12',
      rest_seconds: 60,
      equipment: ex.equipment,
      primaryMuscles: ex.primaryMuscles,
      instructions: ex.instructions
    }));

    // Use type assertion to add exercises to workout
    (workout.exercises as any[]).push(...formattedExercises);

    // Save the updated workout
    await workout.save();

    res.status(200).json({
      message: 'Exercises added to workout successfully',
      workout
    });
  } catch (error) {
    console.error('Error adding exercises to workout:', error);
    res.status(500).json({ message: 'Error adding exercises to workout', error });
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

    // Create the workout
    const newWorkout = new Workout({
      name: workoutName,
      description: workoutDescription,
      goal: goal,
      level: level,
      type: day || split_type,
      duration: duration,
      exercises: formattedExercises
    });

    // Save to database
    const savedWorkout = await newWorkout.save();

    res.status(201).json(savedWorkout);
  } catch (error) {
    res.status(500).json({ message: 'Error generating workout', error });
  }
};