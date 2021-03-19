import * as mongoose from 'mongoose';
export declare const ChatMessageSchema: mongoose.Schema<any>;
export interface Message {
    chatId: string;
    message: string;
    from?: string;
    readBy?: string[];
}
