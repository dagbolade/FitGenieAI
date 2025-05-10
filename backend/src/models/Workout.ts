// backend/src/models/Workout.ts
import { Schema, model, Document } from 'mongoose';

// Exercise within a workout
interface IExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions: string[];
  images?: string[];
}

// Workout document interface
export interface IWorkout extends Document {
  name: string;
  description: string;
  goal: string;
  level: string;
  type: string;
  duration: number;
  exercises: IExercise[];
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Exercise schema
const ExerciseSchema = new Schema<IExercise>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  rest_seconds: { type: Number, required: true },
  equipment: { type: String, required: true },
  primaryMuscles: { type: [String], required: true },
  secondaryMuscles: { type: [String] },
  instructions: { type: [String], required: true },
  images: { type: [String] }
});

// Workout schema
const WorkoutSchema = new Schema<IWorkout>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  goal: { type: String, required: true },
  level: { type: String, required: true, enum: ['beginner', 'intermediate', 'expert'] },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  exercises: { type: [ExerciseSchema], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<IWorkout>('Workout', WorkoutSchema);