import * as mongoose from 'mongoose';

export enum UserNotificationTypes {
  ALERT = 'alert',
  SALES = 'sales',
  HELP_AND_SUPPORT = 'help&support',
}

export enum UserNotificationsIdentifiers {
  INSTRUCTOR_ADDED = 'instructorAdded',
  COURSE_EDITED = 'courseEdited',
  COURSE_DEADLINE = 'courseDeadline',
  ENROLLMENT_CLOSED = 'enrollmentClosed',
  NEW_MESSAGE = 'newMessage',
  NEW_ENQUIRY = 'newEnquiry',
  NEW_CHAT = 'newChat',
  CREATED_CHAT = 'createdChat',
  DAILY_ENROLLMENTS = 'dailyEnrollments',
  DAILY_REVENUE = 'dailyRevenue',
  COURSE_ADDED = 'courseAdded',
  PROMO_ADDED = 'promoAdded',
  PERMISSION_LEVEL = 'permissionLevel',
  BLOG_STATUS = 'blogStatus',
  REFUND_REQUEST = 'refundRequest',
  COLLEGE_JOINED = 'collegeJoined',
  EMPLOYER_JOINED = 'employerJoined',
  USER_JOINED = 'userJoined',
  NEW_PROPOSAL = 'newProposal',
  SOURCE_TALENT_REQUEST = 'sourceTalentRequest',
  EMPLOYER_FORUM_POST = 'employerForumPost',
  EMPLOYER_FORUM_COMMENT = 'employerForumComment',
  EMPLOYER_FORUM_REPLY = 'employerForumReply',
}

export const UsersNotificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    from: { type: mongoose.Schema.Types.ObjectId },
    fromType: { type: String, enum: ['user', 'learner', 'employerAdmin'] },
    identifier: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String }, // for refund request and review report
    channel: { type: String }, // for refund request and review report
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    modifiedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    promo: { type: mongoose.Schema.Types.ObjectId, ref: 'promos' },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollments' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    employerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-companies' },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    chatGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-groups' },
    chatMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'chat-messages' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats' },
    chatModule: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'] },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'messages' },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiries' },
    enquiryMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiry-messages' },
    collegeProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'contact-college-proposals' },
    employerForumPost: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-posts' },
    employerForumComment: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-comments' },
    employerForumReply: { type: mongoose.Schema.Types.ObjectId, ref: 'employer-replies' },
    isSeen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// UsersNotificationSchema.query.byKeyword = function(keyword: string) {
//   return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
// };

UsersNotificationSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface UserNotification extends mongoose.Document {
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
  user?: string;
  modifiedUser?: string;
  isSeen?: string;
}
