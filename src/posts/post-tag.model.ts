import * as mongoose from 'mongoose';

export const PostTagSchema = new mongoose.Schema({
   title: { type: String, required: true },
}, {
  timestamps: true,
});

PostTagSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip( (page - 1) * perPage).limit(perPage);
};

PostTagSchema.query.byKeyword = function(keyword: string) {
  return this.where({title: { $regex: keyword, $options: 'i' }});
};

export interface PostTag {
  title: string;
}
