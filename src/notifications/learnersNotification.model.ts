import * as mongoose from 'mongoose';

export enum LearnerNotificationsIdentifiers {
  COURSE_START = 'courseStart',
  ENROLLMENT_DEADLINE = 'enrollmentDeadline',
  ENROLLMENT_STATUS = 'enrollmentStatus',
  RELATED_COURSE = 'relatedCourse',
  REFUND_REQUEST = 'refundRequest',
  COURSE_REVIEW = 'courseReview',
  PARTNER_REQUEST = 'partnerRequest',
  REVIEW_REPORTED = 'reviewReported',
  NEW_ENQUIRY = 'newEnquiry',
  NEW_MESSAGE = 'newMessage',
  NEW_CHAT = 'newChat',
  CREATED_CHAT = 'createdChat',
  SOURCE_TALENT_REQUEST = 'sourceTalentRequest',
}

export const LearnersNotificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    from: { type: mongoose.Schema.Types.ObjectId },
    fromType: { type: String, enum: ['user', 'learner', 'employerAdmin'] },
    identifier: { type: String, required: true },
    content: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollments' },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'colleges' },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiries' },
    enquiryMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'enquiry-messages' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chats' },
    chatModule: { type: String, enum: ['internal-chat', 'employer-proposal-response', 'source-talent', 'enquiries'] },
    chatMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'messages' },
    isSeen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// LearnersNotificationSchema.query.byKeyword = function(keyword: string) {
//   return this.where({ collegeName: { $regex: keyword, $options: 'i' } });
// };

LearnersNotificationSchema.query.paginate = function(page: number, perPage: number) {
  return this.skip((page - 1) * perPage).limit(perPage);
};

export interface LearnerNotification extends mongoose.Document {
  receiver: string;
  identifier: string;
  content: string;
  course?: string;
  enrollment?: string;
  college?: string;
  isSeen?: string;
}
