import * as mongoose from 'mongoose';

export const EmployerEnquirySchema = new mongoose.Schema(
  {
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    users: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    type: { type: String, enum: ['college', 'unmudl'] },
  },
  {
    timestamps: true,
  },
);

export interface EmployerEnquiry {
  users?: string[];
  employerAdmin: string;
  type: string;
}
