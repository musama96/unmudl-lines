import * as mongoose from 'mongoose';

export const CourseCategorySchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
  },
  {
    timestamps: true,
  },
);

CourseCategorySchema.query.byKeyword = function(keyword: string) {
  return this.where({title: { $regex: keyword, $options: 'i' }});
};
