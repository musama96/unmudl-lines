import * as mongoose from 'mongoose';

export const UserTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  token: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now, expires: 2592000 },
});

export interface UserToken extends mongoose.Document {
  userId: string;
  token: string;
}
