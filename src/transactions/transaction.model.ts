import * as mongoose from 'mongoose';

export const TransactionSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    courseId: { type: mongoose.Types.ObjectId, ref: 'courses' },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export interface Transaction {
  collegeId: string;
  courseId: string;
  amount: number;
}
