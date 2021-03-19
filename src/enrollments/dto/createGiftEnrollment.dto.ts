import { IsOptional, IsString, ValidateNested } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LearnerDataDto } from './learnerData.dto';
import { IsMongoId } from '../../common/validators';

export class CreateGiftEnrollmentDto {
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @IsMongoId(false, { message: responseMessages.common.invalidGiftId })
  giftId: string;

  @ApiHideProperty()
  transferId?: string;
  @ApiHideProperty()
  destPaymentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LearnerDataDto)
  learnerData?: LearnerDataDto;

  @IsMongoId(false, { message: responseMessages.common.invalidPromoId })
  promoId?: string;

  @ApiHideProperty()
  learnerId?: string;

  @ApiHideProperty()
  learnerName?: string;

  @ApiHideProperty()
  transactionId?: string;

  @ApiHideProperty()
  discountType?: string;

  @ApiHideProperty()
  discountPercentage?: number;

  @ApiHideProperty()
  discountTotal?: number;

  @ApiHideProperty()
  salesTax?: number;

  @ApiHideProperty()
  taxPercentage?: number;

  @ApiHideProperty()
  totalPaid?: number;

  @ApiHideProperty()
  taxRate?: number;

  @ApiHideProperty()
  totalRevenue?: number;

  @ApiHideProperty()
  unmudlShare?: number;

  @ApiHideProperty()
  unmudlSharePercentage?: number;

  @ApiHideProperty()
  collegeShare?: number;

  @ApiHideProperty()
  stripeFee?: number;

  @ApiHideProperty()
  courseFee?: number;

  @ApiHideProperty()
  keptByUnmudl?: number;

  @ApiHideProperty()
  sentToCollege?: number;

  @ApiHideProperty()
  status?: string;
}
