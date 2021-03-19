import * as mongoose from 'mongoose';
​
export const StateSchema = new mongoose.Schema({
  abbreviation: {type: String, required: true},
  latitude: {type: Number, required: true},
  longitude: {type: Number, required: true},
  name: {type: String, required: true},
});
​
StateSchema.query.byName = function(keyword) {
  return this.where({ name: { $regex: keyword, $options: 'i' } });
};
