import * as mongoose from 'mongoose';

export const TransactionActivities = {
  CourseApplied: 'courseApplied',
  CourseBought: 'courseBought',
  CourseBoughtWithPromo: 'courseBoughtWithPromo',
  EnrollmentApproved: 'enrollmentApproved',
  EnrollmentDeclined: 'enrollmentDeclined',
  EnrollmentCanceled: 'enrollmentCanceled',
  EnrollmentRefunded: 'enrollmentRefunded',
};

export const TransactionActivityCategorySchema = new mongoose.Schema(
  {
    name: {type: String, enum: ['courseApplied', 'courseBought', 'courseBoughtWithPromo', 'enrollmentApproved', 'enrollmentDeclined', 'enrollmentCanceled', 'enrollmentRefunded'], required: true},
    color: {type: String, required: true},
  },
  {
    timestamps: true,
  },
);

TransactionActivityCategorySchema.query.byName = function(name) {
  return this.where({
    name,
  });
};
