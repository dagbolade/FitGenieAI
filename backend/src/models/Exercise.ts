// backend/src/models/Exercise.ts
import { Schema, model, Document } from 'mongoose';

export interface IExercise extends Document {
  name: string;
  force: string;
  level: string;
  mechanic: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  force: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
  mechanic: { type: String, enum: ['compound', 'isolation', ''] },
  equipment: { type: String, required: true },
  primaryMuscles: { type: [String], required: true },
  secondaryMuscles: { type: [String] },
  instructions: { type: [String], required: true },
  category: { type: String },
  images: { type: [String] }
});

export default model<IExercise>('Exercise', ExerciseSchema);