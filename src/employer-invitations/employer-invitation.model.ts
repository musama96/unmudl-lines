import * as mongoose from 'mongoose';

export const EmployerInvitationSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    emailAddress: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    domainSignup: {type: Boolean, default: false},
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    group: {type: mongoose.Schema.Types.ObjectId, ref: 'employer-groups'},
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    date_accepted: { type: Date },
    isSuspended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

EmployerInvitationSchema.query.byTitle = function(keyword) {
  return this.where({ title: { $regex: keyword, $options: 'i' } });
};

EmployerInvitationSchema.query.byEmployer = function(employerId) {
  return this.where({ employerId });
};

EmployerInvitationSchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};
