import * as mongoose from 'mongoose';

export const PerformanceOutcomesSchema = new mongoose.Schema({
   title: { type: String, required: true },
}, {
  timestamps: true,
});

PerformanceOutcomesSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip( (page - 1) * perPage).limit(perPage);
};

PerformanceOutcomesSchema.query.byKeyword = function(keyword: string) {
  return this.where({title: { $regex: keyword, $options: 'i' }});
};

export interface PerformanceOutcomes {
  title: string;
}
