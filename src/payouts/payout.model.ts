import * as mongoose from 'mongoose';

export const PayoutSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    amount: { type: Number, required: true },
    approvedDate: { type: Date },
    status: { type: String, enum: ['pending', 'approved', 'declined'] },
    collegeUserId: { type: mongoose.Types.ObjectId, ref: 'users' },
    unmudlUserId: { type: mongoose.Types.ObjectId, ref: 'users' },
  },
  {
    timestamps: true,
  },
);

export interface Payout {
  collegeId: string;
  amount: number;
  approvedDate: string;
  status: string;
  collegeUserId: string;
  platformUserId: string;
}
