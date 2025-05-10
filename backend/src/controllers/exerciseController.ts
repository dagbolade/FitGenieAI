// backend/src/controllers/exerciseController.ts
import { Request, Response } from 'express';
import Exercise, { IExercise } from '../models/Exercise';

// Get all exercises
export const getExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { equipment, level, muscle, limit = 50 } = req.query;

    // Build filter object
    const filter: any = {};
    if (equipment) filter.equipment = equipment;
    if (level) filter.level = level;

    if (muscle) {
      filter.$or = [
        { primaryMuscles: muscle },
        { secondaryMuscles: muscle }
      ];
    }

    const exercises = await Exercise.find(filter).limit(Number(limit));
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exercises', error });
  }
};

// Get exercise by ID
export const getExerciseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Fetching exercise with ID: ${id}`);

    // Try to find by MongoDB _id first (if it looks like a valid ObjectId)
    let exercise = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Looking up by MongoDB _id`);
      exercise = await Exercise.findById(id);
    }

    // If not found or id is not a valid ObjectId, try to find by custom id field
    if (!exercise) {
      console.log(`Looking up by custom id field`);
      exercise = await Exercise.findOne({ id: id });
    }

    if (!exercise) {
      console.log(`Exercise not found with id: ${id}`);
      res.status(404).json({ message: 'Exercise not found' });
      return;
    }

    console.log(`Found exercise: ${exercise.name}`);
    res.status(200).json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ message: 'Error fetching exercise', error });
  }
};

// Get available equipment types
export const getEquipmentTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get distinct equipment values
    const equipmentTypes = await Exercise.distinct('equipment');
    res.status(200).json(equipmentTypes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment types', error });
  }
};

// Get available muscle groups
export const getMuscleGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get distinct primary muscle values
    const primaryMuscles = await Exercise.distinct('primaryMuscles');
    res.status(200).json(primaryMuscles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching muscle groups', error });
  }
};