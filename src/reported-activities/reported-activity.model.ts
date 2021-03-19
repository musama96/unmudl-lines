import * as mongoose from 'mongoose';

export const ReportedActivitySchema = new mongoose.Schema(
  {
    reviewId: { type: mongoose.Types.ObjectId, ref: 'reviews' },
    status: { type: String, enum: ['pending', 'warned', 'suspended', 'ignored'] },
    reportedLearnerId: { type: mongoose.Types.ObjectId, ref: 'learners' },
    reportingLearnerId: { type: mongoose.Types.ObjectId, ref: 'learners' },
    reportingCollegeId: { type: mongoose.Types.ObjectId, ref: 'users' },
    reportingUserId: { type: mongoose.Types.ObjectId, ref: 'colleges' },
    resolutionDate: { type: Date },
    reportDate: { type: Date },
    reviewDate: { type: Date },
    comment: {type: String},
  },
  {
    timestamps: true,
  },
);

export interface ReportedActivity {
  reviewId: string;
  resolutionDate?: any;
  reportDate?: any;
  status?: string;
  reportedLearnerId?: string;
  reportingLearnerId?: string;
  reportingCollegeId?: string;
  reportingUserId?: string;
  comment?: string;
}
