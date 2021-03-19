import * as mongoose from 'mongoose';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';

export const EnrollmentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'learners' },
    promoId: { type: mongoose.Schema.Types.ObjectId, ref: 'promos', default: null },
    giftId: { type: mongoose.Schema.Types.ObjectId, ref: 'gift-course', default: null },
    discountPercentage: { type: Number, default: 0 },
    discountType: { type: String, enum: ['unmudl', 'both'] },
    discountTotal: { type: Number, default: 0 },
    transactionId: { type: String },
    transferId: { type: String },
    destPaymentId: { type: String },
    salesTax: { type: Number, required: true },
    taxPercentage: { type: Number, required: true },
    totalPaid: { type: Number, required: true },
    totalRevenue: { type: Number, default: 0, required: true },
    unmudlShare: { type: Number, required: true },
    unmudlSharePercentage: { type: Number, required: true },
    collegeShare: { type: Number, required: true },
    sentToCollege: { type: Number, required: false, default: 0 },
    keptByUnmudl: { type: Number, required: false, default: 0 },
    stripeFee: { type: Number, required: true },
    courseFee: { type: Number, required: true },
    chargeAttempts: { type: Number, default: 0 },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'processed', 'transferred', 'declined', 'canceled', 'refunded'],
    },
    learnerData: {
      firstname: { type: String, default: null },
      lastname: { type: String, default: null },
      gender: { type: String, required: false },
      emailAddress: { type: String, default: null },
      phoneNumber: { type: String, default: null },
      address: { type: String, default: null },
      dateOfBirth: { type: Date, default: null },
      hasStudentId: { type: Boolean, default: null },
      studentId: { type: String, default: null },
      city: { type: String, required: false },
      state: {
        longName: { type: String },
        shortName: { type: String },
      }, // String, // {type: mongoose.Schema.Types.ObjectId, ref: 'states', required: true},
      zip: { type: String, required: false },
      coordinates: {
        type: {
          type: String,
          default: 'Point',
        },
        coordinates: {
          // must be an array of two numbers, [lng, lat]
          type: [Number],
          required: true,
        },
      },
    },
    rejectionInfo: {
      explanation: String,
      courseFull: Boolean,
      courseCancelled: Boolean,
      furtherInfo: Boolean,
      minRequirements: Boolean,
    },
    courseActivity: {
      status: { type: String, enum: ['not-started', 'in-progress', 'completed'] },
      userId: { type: String },
      courseId: { type: String },
      averageScore: { type: String },
      totalTimeSpentInMinutes: { type: String },
      startedDate: { type: String },
      completedDate: { type: String },
      certificateNumber: { type: String },
      certificateURL: { type: String },
      total: { type: Number },
      started: { type: Number },
      completed: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

export interface Enrollment {
  courseId: string;
  learnerId?: string;
  promoId?: string;
  transactionId?: string;
  discountPercentage?: number;
  discountTotal?: number;
  discountType?: string;
  transactionToken?: string;
  salesTax?: number;
  taxPercentage?: number;
  totalPaid?: number;
  totalRevenue?: number;
  unmudlShare?: number;
  unmudlSharePercentage?: number;
  collegeShare?: number;
  stripeFee?: number;
  courseFee?: number;
  status?: EnrollmentStatus;
}
