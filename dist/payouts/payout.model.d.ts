import * as mongoose from 'mongoose';
export declare const PayoutSchema: mongoose.Schema<any>;
export interface Payout {
    collegeId: string;
    amount: number;
    approvedDate: string;
    status: string;
    collegeUserId: string;
    platformUserId: string;
}
