import * as mongoose from 'mongoose';

export enum ChatType {
  COLLEGE = 'college',
  EMPLOYER = 'employer',
  LEARNER = 'learner',
}

export const ChatSchema = new mongoose.Schema(
  {
    groupName: { type: String, default: null },

    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    employerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    users: [{ type: mongoose.Types.ObjectId, ref: 'users' }],

    readByLearner: { type: Boolean },
    readByEmployerAdmins: [{ type: mongoose.Types.ObjectId, ref: 'employer-admins' }],
    readByUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }],

    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    college: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    employer: { type: mongoose.Types.ObjectId, ref: 'employer-companies' },
    type: { type: String, default: ChatType.COLLEGE },
    module: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'], default: 'internal-chat' },
    moduleDocumentId: { type: mongoose.Types.ObjectId, default: null },
    createdBy: { type: mongoose.Types.ObjectId },
    createdByType: { type: String, enum: ['employerAdmin', 'user', 'learner'] },
    showToCreator: { type: Boolean, default: true }, // for source talent
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export interface Chat {
  _id?: string;
  learner?: any | string;
  employerAdmins?: any[] | string[];
  users?: any[] | string[];
  course: any | string;
  college?: any | string;
  employer?: any | string;
  createdBy?: any | string;
  module?: string;
}
