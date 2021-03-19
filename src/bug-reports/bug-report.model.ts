import * as mongoose from 'mongoose';
import {Severity} from '../common/enums/createBugReport.enum';

export const BugReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Types.ObjectId, ref: 'learners' },
  title: { type: String, required: true },
  description: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high'] },
  status: { type: String, enum: ['pending', 'reviewed'] },
  comment: { type: String },
  resolvedBy: { type: mongoose.Types.ObjectId, ref: 'users' },
  resolvedAt: { type: Date },
}, {
  timestamps: true,
});

export interface BugReport {
  _id?: string;
  reportedBy?: string;
  title: string;
  description?: string;
  severity: Severity;
  comment?: string;
}
