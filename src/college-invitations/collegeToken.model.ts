import * as mongoose from 'mongoose';

export const CollegeTokenSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
  token: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});
