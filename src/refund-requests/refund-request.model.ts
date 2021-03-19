import * as mongoose from 'mongoose';

export enum RefundRequestReason {
  DUPLICATE = 'duplicate',
  UNINTENTIONAL = 'unintentional',
  WRONG_AMOUNT = 'wrong-amount',
  NEEDS_NOT_MET = 'needs-not-met',
  NOT_AS_ADVERTISED = 'not-as-advertised',
  CHANGED_MIND = 'changed-mind',
}

export const RefundRequestSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Types.ObjectId, ref: 'learners' },
    courseId: { type: mongoose.Types.ObjectId, ref: 'courses' },
    enrollmentId: { type: mongoose.Types.ObjectId, ref: 'enrollments' },
    status: { type: String, enum: ['pending', 'refunded', 'rejected'] },
    dateResolved: { type: Date },
    reason: [{ type: String }],
    otherInfo: { type: String },
    transactionId: { type: String },
    transferId: { type: String },
    refundAmount: { type: Number },
    refundId: { type: String },
  },
  {
    timestamps: true,
  },
);

export interface RefundRequest {
  requestedBy?: string;
  courseId?: string;
  enrollmentId: string;
  status?: string;
  dateResolved?: any;
  reason: string[];
}
