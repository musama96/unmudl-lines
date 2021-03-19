import * as mongoose from 'mongoose';

export const SourceTalentSchema = new mongoose.Schema(
  {
    title: { type: String },
    message: { type: String },
    type: { type: String, enum: ['learner', 'user'] },
    course: { type: mongoose.Types.ObjectId, ref: 'courses' },
    noOfLearners: { type: Number, default: 0 },
    noOfUsers: { type: Number, default: 0 },
    sentToLearners: [{ type: mongoose.Types.ObjectId, ref: 'learners' }],
    sentToUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    chats: [{ type: mongoose.Types.ObjectId, ref: 'chats' }],
    createdBy: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    employer: [{ type: mongoose.Types.ObjectId, ref: 'employers' }],
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);
