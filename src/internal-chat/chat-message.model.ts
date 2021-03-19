import * as mongoose from 'mongoose';

export const ChatMessageSchema = new mongoose.Schema({
  chatId: {type: mongoose.Types.ObjectId, ref: 'chat-groups'},
  message: { type: String },
  from: {type: mongoose.Types.ObjectId, ref: 'users'},
  readBy: [{type: mongoose.Types.ObjectId, ref: 'users'}],
}, {
  timestamps: true,
});

export interface Message {
  chatId: string;
  message: string;
  from?: string;
  readBy?: string[];
}
