// backend/src/models/UserWorkout.ts
import { Schema, model, Document } from 'mongoose';

export interface IUserWorkout extends Document {
  userId: Schema.Types.ObjectId;
  workoutId: Schema.Types.ObjectId;
  name: string;
  description: string;
  scheduled: Date;
  completed: boolean;
  completedAt?: Date;
  duration: number;
  exercises: Array<{
    exerciseId: Schema.Types.ObjectId;
    name: string;
    sets: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>;
  createdAt: Date;
}

const UserWorkoutSchema = new Schema<IUserWorkout>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: Schema.Types.ObjectId, ref: 'Workout', required: true },
  name: { type: String, required: true },
  description: { type: String },
  scheduled: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  duration: { type: Number, required: true },
  exercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    name: String,
    sets: [{
      reps: Number,
      weight: Number,
      completed: Boolean
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster querying
UserWorkoutSchema.index({ userId: 1, scheduled: 1 });
UserWorkoutSchema.index({ userId: 1, completed: 1 });

export default model<IUserWorkout>('UserWorkout', UserWorkoutSchema);