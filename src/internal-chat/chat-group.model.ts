import * as mongoose from 'mongoose';

export const ChatGroupSchema = new mongoose.Schema({
  groupName: { type: String },
  groupPhoto: {type: String},
  createdBy: {type: mongoose.Types.ObjectId, ref: 'users'},
  members: [{type: mongoose.Types.ObjectId, ref: 'users'}],
}, {
  timestamps: true,
});

export interface ChatGroup {
  groupName?: string;
  members: string[];
  // message?: string;
  groupPhoto?: string;
  createdBy?: string;
}
