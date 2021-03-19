import { LearnerDataDto } from './learnerData.dto';
export declare class CreateGiftEnrollmentDto {
    courseId: string;
    giftId: string;
    transferId?: string;
    destPaymentId?: string;
    learnerData?: LearnerDataDto;
    promoId?: string;
    learnerId?: string;
    learnerName?: string;
    transactionId?: string;
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
