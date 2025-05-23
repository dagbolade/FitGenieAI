// backend/src/models/UserProgress.ts
import { Schema, model, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: Schema.Types.ObjectId;
  workoutStats: {
    totalWorkouts: number;
    completedWorkouts: number;
    totalDuration: number; // in minutes
    totalCaloriesBurned: number; // Add this field to the interface
    lastWorkoutDate: Date;
  };
  exerciseStats: {
    totalExercises: number;
    favoriteExercises: Array<{
      name: string;
      count: number;
    }>;
    muscleGroups: Array<{
      name: string;
      count: number;
    }>;
  };
  weeklyActivity: Array<{
    date: Date;
    duration: number; // in minutes
    calories: number; // Add this field to the interface
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  workoutStats: {
    totalWorkouts: { type: Number, default: 0 },
    completedWorkouts: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    totalCaloriesBurned: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date }
  },
  exerciseStats: {
    totalExercises: { type: Number, default: 0 },
    favoriteExercises: [{
      name: { type: String, required: true },
      count: { type: Number, default: 0 }
    }],
    muscleGroups: [{
      name: { type: String, required: true },
      count: { type: Number, default: 0 }
    }]
  },
  weeklyActivity: [{
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    calories: { type: Number, default: 0 } // Add this field to the schema
  }]
}, { timestamps: true });

export default model<IUserProgress>('UserProgress', UserProgressSchema);