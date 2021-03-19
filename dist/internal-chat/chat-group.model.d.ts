import * as mongoose from 'mongoose';
export declare const ChatGroupSchema: mongoose.Schema<any>;
export interface ChatGroup {
    groupName?: string;
    members: string[];
    groupPhoto?: string;
    createdBy?: string;
}
