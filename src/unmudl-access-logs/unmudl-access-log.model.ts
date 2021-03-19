import * as mongoose from 'mongoose';

export const UnmudlAccessLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['college', 'employer'] },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
  },
  {
    timestamps: true,
  },
);
