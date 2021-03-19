import * as mongoose from 'mongoose';
export declare const TransactionSchema: mongoose.Schema<any>;
export interface Transaction {
    collegeId: string;
    courseId: string;
    amount: number;
}
