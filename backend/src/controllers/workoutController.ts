import { Request, Response } from 'express';
import Workout, { IWorkout } from '../models/Workout';

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