import { RefundStatus } from '../../common/enums/createRefund.enum';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, ArrayMinSize } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { RefundRequestReason } from '../refund-request.model';
import { IsArray, IsMongoId } from '../../common/validators';

export class CreateRefundDto {
  @IsMongoId(false, { message: responseMessages.createRefund.enrollmentId })
  enrollmentId: string;

  @ApiProperty({ type: String, default: '["duplicate", "unintentional"]' })
  @IsArray(false)
  @ArrayMinSize(1, { message: responseMessages.createRefund.noReasonSelected })
  @IsEnum(RefundRequestReason, { each: true, message: responseMessages.createRefund.reason })
  reason: RefundRequestReason[];

  @IsOptional()
  @IsString()
  otherInfo?: string;

  @ApiHideProperty()
  status?: RefundStatus;

  @ApiHideProperty()
  transactionId?: string;

  @ApiHideProperty()
  requestedBy?: string;

  @ApiHideProperty()
  courseId?: string;
}
