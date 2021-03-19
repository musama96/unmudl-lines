import * as mongoose from 'mongoose';

export enum EmployerAdminNotificationTypes {
  ALERT = 'alert',
  SALES = 'sales',
  HELP_AND_SUPPORT = 'help&support',
}

export enum EmployerAdminNotificationsIdentifiers {
  NEW_MESSAGE = 'newMessage',
  NEW_CHAT = 'newChat',
  CREATED_CHAT = 'createdChat',
  EMPLOYER_JOINED = 'employerAdminJoined',
  PROPOSAL_RESPONSE = 'proposalResponse',
  FORUM_POST = 'forumPost',
  FORUM_COMMENT = 'forumComment',
  FORUM_REPLY = 'forumReply',
}

export const EmployerAdminsNotificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'employerAdmins' },
    from: { type: mongoose.Schema.Types.ObjectId },
    fromType: { type: String, enum: ['user', 'learner', 'employerAdmin'] },
    identifier: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats' },
    chatModule: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'] },
    chatMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'messages' },
    proposalResponse: { type: mongoose.Schema.Types.ObjectId, ref: 'contact-college-responses' },
    isSeen: { type: Boolean, default: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    modifiedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-admins' },
    forumPost: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-posts' },
    forumComment: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-comments' },
    forumReply: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-replies' },
  },
  {
    timestamps: true,
  },
);

// EmployerAdminsNotificationSchema.query.byKeyword = function(keyword: string) {
//   return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
// };

EmployerAdminsNotificationSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface EmployerAdminNotification extends mongoose.Document {
  receiver?: string;
  identifier: string;
  content: string;
  type: string;
  course?: string;
  status?: string;
  channel?: string;
  enrollment?: string;
  college?: string;
  learner?: string;
  employerAdmin?: string;
  modifiedEmployerAdmin?: string;
  isSeen?: string;
  forumPost?: string;
  forumComment?: string;
  forumReply?: string;
}
