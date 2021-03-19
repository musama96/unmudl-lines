import * as mongoose from 'mongoose';

export const EmployerEnquiryMessageSchema = new mongoose.Schema(
  {
    enquiry: { type: mongoose.Types.ObjectId, ref: 'enquiries' },
    message: { type: String, required: true, trim: true },
    employerAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    readByEmployerAdmin: { type: Boolean, default: true },
    readByUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
  },
  {
    timestamps: true,
  },
);
