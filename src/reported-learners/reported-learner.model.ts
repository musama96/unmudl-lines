import * as mongoose from 'mongoose';

export enum ReportLearnerStatus {
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  IGNORED = 'ignored',
}

export const ReportedLearnerSchema = new mongoose.Schema(
  {
    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    colleges: [{ type: mongoose.Types.ObjectId, ref: 'colleges' }],
    report: [{
      user: {type: mongoose.Types.ObjectId, ref: 'users'},
      reason: { type: String },
    }],
    status: { type: String, default: 'pending' },
  },
  {
    timestamps: true,
  },
);

ReportedLearnerSchema.query.paginate = function(page, perPage) {
  return this.skip((page - 1) * perPage).limit(perPage);
};
