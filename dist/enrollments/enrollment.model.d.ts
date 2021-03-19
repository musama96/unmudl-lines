import * as mongoose from 'mongoose';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
export declare const EnrollmentSchema: mongoose.Schema<any>;
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
