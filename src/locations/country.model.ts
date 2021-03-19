import * as mongoose from 'mongoose';
​
export const CountrySchema = new mongoose.Schema({
  name: {type: String, required: true},
  code: {type: Number},
});
​
CountrySchema.query.byName = function(keyword) {
  return this.where({ name: { $regex: keyword, $options: 'i' } });
};
