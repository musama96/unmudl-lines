import * as mongoose from 'mongoose';

export const BlogTagSchema = new mongoose.Schema({
   title: { type: String, required: true },
   slug: {type: String, required: true},
}, {
  timestamps: true,
});

BlogTagSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip( (page - 1) * perPage).limit(perPage);
};

BlogTagSchema.query.byKeyword = function(keyword: string) {
  return this.where({title: { $regex: keyword, $options: 'i' }});
};

export interface BlogTag {
  title: string;
  slug?: string;
}
