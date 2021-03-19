import * as mongoose from 'mongoose';

export const EmployerCommentSchema = new mongoose.Schema(
  {
    employerPost: { type: mongoose.Types.ObjectId, ref: 'employer-posts' },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    content: {type: String, trim: true},
    totalReplies: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: true,
  },
);

EmployerCommentSchema.query.byPost = function(postId) {
  return this.where({ employerPost: mongoose.Types.ObjectId(postId) });
};

EmployerCommentSchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface Reply {
  postId: string;
  employerPost?: string;
  employerAdmin?: string;
  user?: string;
  learner?: string;
  content: string;
}
