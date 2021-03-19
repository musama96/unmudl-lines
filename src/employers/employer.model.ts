import * as mongoose from 'mongoose';

export const EmployerSchema = new mongoose.Schema({
   title: { type: String, required: true, trim: true },
   website: { type: String, required: false },
   logo: {type: String, required: false},
}, {
  timestamps: true,
});

EmployerSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip( (page - 1) * perPage).limit(perPage);
};

EmployerSchema.query.byKeyword = function(keyword: string) {
  return this.where({title: { $regex: keyword, $options: 'i' }});
};

export interface Employer {
  title: string;
  website?: string;
  logo: string;
}
