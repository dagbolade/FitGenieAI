// src/scripts/seedExercises.ts
import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    seedExercises();
  })
  .catch((error: Error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Define interfaces
interface ExerciseDocument extends mongoose.Document {
  name: string;
  force?: string;
  level?: string;
  mechanic?: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions: string[];
  category?: string;
  images?: string[];
  id?: string;
}

interface CsvRow {
  name: string;
  force: string;
  level: string;
  mechanic: string;
  equipment: string;
  primaryMuscles: string;
  secondaryMuscles: string;
  instructions: string;
  category: string;
  images: string;
  id: string;
}

// Define Schema
const ExerciseSchema = new mongoose.Schema<ExerciseDocument>({
  name: { type: String, required: true },
  force: { type: String },
  level: { type: String },
  mechanic: { type: String },
  equipment: { type: String, required: true },
  primaryMuscles: { type: [String], required: true },
  secondaryMuscles: { type: [String] },
  instructions: { type: [String], required: true },
  category: { type: String },
  images: { type: [String] },
  id: { type: String }
});

// Create model
const Exercise = mongoose.models.Exercise as mongoose.Model<ExerciseDocument> ||
                 mongoose.model<ExerciseDocument>('Exercise', ExerciseSchema);

// Helper function to parse string arrays
function parseStringToArray(str: string | undefined): string[] {
  if (!str || typeof str !== 'string') return [];

  // Handle empty strings
  if (str.trim() === '') return [];

  // Try to handle various formats
  try {
    // If it looks like a JSON array
    if (str.trim().startsWith('[') && str.trim().endsWith(']')) {
      // Replace single quotes with double quotes
      const jsonStr = str.replace(/'/g, '"');
      return JSON.parse(jsonStr);
    }

    // Simple comma-separated string
    return str.split(',').map(item => item.trim()).filter(Boolean);
  } catch (e) {
    console.log(`Error parsing string: ${str}`);
    // Fallback: just return the string as a single-item array
    return [str];
  }
}

async function seedExercises(): Promise<void> {
  try {
    // Check if exercises already exist
    const count = await Exercise.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} exercises. Skipping seed.`);
      process.exit(0);
      return;
    }

    const csvPath = path.join(process.cwd(), 'data/clean_exercises.csv');
    console.log(`Looking for CSV at: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at ${csvPath}`);
      process.exit(1);
      return;
    }

    const exercises: Partial<ExerciseDocument>[] = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: CsvRow) => {
        // Log the first row to see the structure
        if (exercises.length === 0) {
          console.log('First row data structure:');
          console.log(data);
        }

        const exercise: Partial<ExerciseDocument> = {
          name: data.name || '',
          force: data.force || '',
          level: data.level || 'beginner',
          mechanic: data.mechanic || '',
          equipment: data.equipment || 'body only',
          primaryMuscles: parseStringToArray(data.primaryMuscles),
          secondaryMuscles: parseStringToArray(data.secondaryMuscles),
          instructions: parseStringToArray(data.instructions),
          category: data.category || '',
          images: parseStringToArray(data.images),
          id: data.id || new mongoose.Types.ObjectId().toString()
        };

        exercises.push(exercise);
      })
      .on('end', async () => {
        console.log(`Parsed ${exercises.length} exercises from CSV`);

        if (exercises.length === 0) {
          console.error('No exercises were parsed from the CSV. Check the file format.');
          process.exit(1);
          return;
        }

        try {
          await Exercise.insertMany(exercises);
          console.log(`Successfully seeded ${exercises.length} exercises`);
          process.exit(0);
        } catch (err) {
          console.error('Error inserting exercises:', err);
          process.exit(1);
        }
      })
      .on('error', (err: Error) => {
        console.error('Error reading CSV:', err);
        process.exit(1);
      });
  } catch (error) {
    console.error('Error in seed process:', error);
    process.exit(1);
  }
}