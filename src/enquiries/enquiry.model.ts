import * as mongoose from 'mongoose';

export const EnquirySchema = new mongoose.Schema({
  learner: {type: mongoose.Types.ObjectId, ref: 'learners'},
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
  users: [{type: mongoose.Types.ObjectId, ref: 'users'}],
}, {
  timestamps: true,
});

export interface Enquiry {
  users?: string[];
  learner: string;
  enquiry?: string;
}
