import * as mongoose from 'mongoose';

export enum Portal {
  COLLEGE = 'college',
  ADMIN = 'admin',
  LEARNER = 'learner',
  EMPLOYER = 'employer',
}

export const EmailLogSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    from: { type: String },
    subject: { type: String },
    template: { type: String },
    content: { type: String },
    portal: { type: String, enum: ['college', 'admin', 'learner', 'employer'] },
  },
  {
    timestamps: true,
  },
);

export interface EmailLog {
  to: String,
  from: String,
  subject: String,
  template: String,
  content?: String,
  portal?: String,
  context?: any,
}
