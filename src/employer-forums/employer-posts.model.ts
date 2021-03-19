import * as mongoose from 'mongoose';

export const EmployerPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'users' },
    employerAdmin: { type: mongoose.Types.ObjectId, ref: 'employer-admins' },
    totalComments: { type: Number, required: false, default: 0 },
    topic: {type: String, trim: true},
    content: {type: String, trim: true},
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'employer-post-tags' }],
  },
  {
    timestamps: true,
  },
);

EmployerPostSchema.query.byTopic = function(keyword) {
  return this.where({ topic: { $regex: keyword, $options: 'i' } });
};

EmployerPostSchema.query.paginate = function(page: number, perPage: number) {
  page = parseInt(String(page), 10);
  perPage = parseInt(String(perPage), 10);
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface Post {
  user?: string;
  employerAdmin?: string;
  topic: string;
  content: string;
}
