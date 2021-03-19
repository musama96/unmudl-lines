import { RefundStatus } from '../../common/enums/createRefund.enum';
import { RefundRequestReason } from '../refund-request.model';
export declare class CreateRefundDto {
    enrollmentId: string;
    reason: RefundRequestReason[];
    otherInfo?: string;
    status?: RefundStatus;
    transactionId?: string;
    requestedBy?: string;
    courseId?: string;
}
