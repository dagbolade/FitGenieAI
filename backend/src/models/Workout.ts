import { Schema, model, Document } from 'mongoose';

// Exercise within a workout
interface IExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  equipment: string;
  muscleGroup: string[];
  instructions?: string[];
}

// Workout document interface
export interface IWorkout extends Document {
  name: string;
  description: string;
  type: string;
  level: string;
  goal: string;
  duration: number;
  exercises: IExercise[];
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Exercise schema
const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  rest: { type: Number, required: true },
  equipment: { type: String, required: true },
  muscleGroup: { type: [String], required: true },
  instructions: { type: [String] }
});

// Workout schema
const WorkoutSchema = new Schema<IWorkout>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  level: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  goal: { type: String, required: true },
  duration: { type: Number, required: true },
  exercises: { type: [ExerciseSchema], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<IWorkout>('Workout', WorkoutSchema);