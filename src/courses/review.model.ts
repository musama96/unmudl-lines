import * as mongoose from 'mongoose';

export const ReviewSchema = new mongoose.Schema(
  {
    learnerId: {type: mongoose.Schema.Types.ObjectId, ref: 'learners', required: true},
    courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true},
    rating: {type: Number, required: true},
    comment: {type: String, required: true},
  },
  {
    timestamps: true,
  },
);

export interface Review extends mongoose.Document {
  full_name: string;
  email_address: string;
  username: string;
  password: string;
}
