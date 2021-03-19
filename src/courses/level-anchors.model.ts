import * as mongoose from 'mongoose';

export const LevelAnchorsSchema = new mongoose.Schema({
   elementID: { type: String, required: true },
   elementName: { type: String, required: true },
   scaleID: { type: String, required: false },
   scaleName: { type: String, required: false },
   anchorValue: { type: String, required: false },
   anchorDescription: { type: String, required: false },
}, {
  timestamps: true,
});
