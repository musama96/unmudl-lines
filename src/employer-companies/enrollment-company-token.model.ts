import * as mongoose from 'mongoose';

export const EnrollmentCompanyTokenSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
  token: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});
