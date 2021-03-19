import * as mongoose from 'mongoose';

export const EmployerAdminTokenSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
  token: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});

export interface EmployerAdminToken extends mongoose.Document {
  adminId: string;
  token: string;
}
