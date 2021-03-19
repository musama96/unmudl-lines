import * as mongoose from 'mongoose';

export const LearnerTokenSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    token: { type: String },
    verificationCode: { type: Number },
    date: { type: Date, required: true, default: Date.now, expires: 172800 },
  },
);

export interface LearnerToken extends mongoose.Document {
  learnerId: string;
  token?: string;
  verificationCode?: number;
}
