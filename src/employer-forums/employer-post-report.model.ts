import * as mongoose from 'mongoose';

export enum PostReportStatus {
  Ignored = 'ignored',
  Warned = 'warned',
  Delete = 'deleted',
}

export const EmployerPostReportSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Types.ObjectId, ref: 'posts' },
    reply: { type: mongoose.Types.ObjectId, ref: 'replies' },
    reportingUsers: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' }],
    reportingLearners: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'learners' }],
    status: {type: String, default: 'pending'},
  },
  {
    timestamps: true,
  },
);

// PostSchema.query.byTopic = function(keyword) {
//   return this.where({ topic: { $regex: keyword, $options: 'i' } });
// };

EmployerPostReportSchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};

// export interface Post {
//   author: string;
//   topic: string;
//   content: string;
//   numId?: number;
// }
