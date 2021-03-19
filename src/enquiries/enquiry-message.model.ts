import * as mongoose from 'mongoose';
import { MessageFrom, MessageStatus } from './dto/newEnquiry.dto';

export const EnquiryMessageSchema = new mongoose.Schema(
  {
    enquiry: {type: mongoose.Types.ObjectId, ref: 'enquiries'},
    message: { type: String, required: true, trim: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    readByLearner: {type: Boolean, default: true},
    readByUsers: [{type: mongoose.Types.ObjectId, ref: 'users'}],
  },
  {
    timestamps: true,
  },
);

// learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
// course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
// from: { type: MessageFrom, required: true },
// message: { type: String, required: true, trim: true },
// collegeRep: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
// status: {
//   type: MessageStatus,
//   required: true,
//   default: MessageStatus.UNREAD,
// },
