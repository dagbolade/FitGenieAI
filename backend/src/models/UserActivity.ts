// backend/src/models/UserActivity.ts
import { Schema, model, Document } from 'mongoose';

export interface IUserActivity extends Document {
  userId: Schema.Types.ObjectId;
  type: string; // 'workout', 'exercise', 'ai_coach', etc.
  title: string;
  referenceId: string; // Reference to workout ID, exercise ID, etc.
  createdAt: Date;
}

const UserActivitySchema = new Schema<IUserActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  referenceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster querying
UserActivitySchema.index({ userId: 1, createdAt: -1 });

export default model<IUserActivity>('UserActivity', UserActivitySchema);