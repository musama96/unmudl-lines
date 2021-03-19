import { LearnerDataDto } from './learnerData.dto';
export declare enum EnrollmentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    PROCESSED = "processed",
    DECLINED = "declined",
    CANCELED = "canceled",
    REFUNDED = "refunded"
}
export declare class CreateEnrollmentDto {
    courseId: string;
    cardId?: string;
    deleteCard?: boolean;
    transferId?: string;
    destPaymentId?: string;
    learnerData?: LearnerDataDto;
    promoId?: string;
    learnerId?: string;
    learnerName?: string;
    transactionId?: string;
    stripeCustomerId?: string;
    discountType?: string;
    discountPercentage?: number;
    discountTotal?: number;
    salesTax?: number;
    taxPercentage?: number;
    totalPaid?: number;
    taxRate?: number;
    totalRevenue?: number;
    unmudlShare?: number;
    unmudlSharePercentage?: number;
    collegeShare?: number;
    stripeFee?: number;
    courseFee?: number;
    keptByUnmudl?: number;
    sentToCollege?: number;
    status?: string;
}
