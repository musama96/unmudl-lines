import * as mongoose from 'mongoose';

export const EmployerPostTagSchema = new mongoose.Schema({
   title: { type: String, required: true },
}, {
  timestamps: true,
});

EmployerPostTagSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip( (page - 1) * perPage).limit(perPage);
};

EmployerPostTagSchema.query.byKeyword = function(keyword: string) {
  return this.where({title: { $regex: keyword, $options: 'i' }});
};

export interface PostTag {
  title: string;
}
