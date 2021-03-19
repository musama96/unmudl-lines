import * as mongoose from 'mongoose';

export const InvitationSchema = new mongoose.Schema(
  {
    fullname: {type: String, required: true},
    emailAddress: {type: String, required: true, trim: true, lowercase: true},
    role: {type: String, enum: ['instructor', 'moderator', 'manager', 'admin', 'superadmin'], required: true},
    status: {type: String, enum: ['pending', 'accepted'], default: 'pending'},
    collegeId: {type: mongoose.Schema.Types.ObjectId, ref: 'colleges'},
    invitedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    isPromoted: {type: Boolean, default: false},
  },
  {
    timestamps: true,
  },
);

InvitationSchema.query.byName = function(keyword) {
  return this.where({ fullname: { $regex: keyword, $options: 'i' } });
};

InvitationSchema.query.byCollege = function(collegeId) {
  return this.where({ collegeId });
};

InvitationSchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface Invitation extends mongoose.Document {
  fullname: string;
  emailAddress: string;
  role: string;
  collegeId?: string;
  invitedBy?: string;
  courseIds?: string[];
}
