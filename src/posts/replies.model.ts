import * as mongoose from 'mongoose';

export const ReplySchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Types.ObjectId, ref: 'posts' },
    learner: { type: mongoose.Types.ObjectId, ref: 'learners' },
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    content: {type: String, trim: true},
  },
  {
    timestamps: true,
  },
);

ReplySchema.query.byPost = function(postId) {
  return this.where({ postId: mongoose.Types.ObjectId(postId) });
};

ReplySchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface Reply {
  postId: string;
  learner?: string;
  user?: string;
  content: string;
}
