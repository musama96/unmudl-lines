import * as mongoose from 'mongoose';

export const EmployerReplySchema = new mongoose.Schema(
  {
    employerComment: { type: mongoose.Types.ObjectId, ref: 'employer-comments' },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    content: {type: String, trim: true},
  },
  {
    timestamps: true,
  },
);

// EmployerReplySchema.query.byPost = function(postId) {
//   return this.where({ postId: mongoose.Types.ObjectId(postId) });
// };

EmployerReplySchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};

// export interface Reply {
//   postId: string;
//   employerPost?: string;
//   employerAdmin?: string;
//   user?: string;
//   learner?: string;
//   content: string;
// }
