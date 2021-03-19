import * as mongoose from 'mongoose';

export const MessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Types.ObjectId, ref: 'chats' },
    message: { type: String, trim: true },
    title: { type: String, trim: true },
    attachments: [{ type: String }],

    employerAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },

    readByLearner: { type: Boolean, default: false },
    readByUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    readByEmployerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
  },
  {
    timestamps: true,
  },
);
