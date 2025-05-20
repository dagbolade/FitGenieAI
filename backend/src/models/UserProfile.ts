// backend/src/models/UserProfile.ts
import { Schema, model, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Schema.Types.ObjectId;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: string;
  fitnessLevel: string;
  goals: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weight: { type: Number, default: null },
  height: { type: Number, default: null },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: null },
  fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'beginner' },
  goals: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default model<IUserProfile>('UserProfile', UserProfileSchema);