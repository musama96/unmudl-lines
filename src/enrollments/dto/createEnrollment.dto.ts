import { IsOptional, IsString, ValidateNested } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LearnerDataDto } from './learnerData.dto';
import { IsMongoId } from '../../common/validators';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  DECLINED = 'declined',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export class CreateEnrollmentDto {
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId: string;

  @IsOptional()
  @IsString({ message: responseMessages.createEnrollment.stripeCustomerId })
  cardId?: string;

  deleteCard?: boolean;

  @ApiHideProperty()
  transferId?: string;
  @ApiHideProperty()
  destPaymentId?: string;

  // @IsOptional()
  // @IsString()
  // name?: string;

  // @IsOptional()
  // @IsString()
  // emailAddress?: string;

  // @IsOptional()
  // @IsString()
  // phoneNumber?: string;

  // @IsOptional()
  // @IsString()
  // streetAddress?: string;

  // @IsOptional()
  // @IsDateString()
  // dateOfBirth?: string;

  // @IsOptional()
  // @IsBoolean()
  // hasStudentId?: boolean;

  // @IsOptional()
  // @IsString()
  // studentId?: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => LearnerDataDto)
  learnerData?: LearnerDataDto;

  @IsMongoId(true, { message: responseMessages.common.invalidPromoId })
  promoId?: string;

  @ApiHideProperty()
  learnerId?: string;

  @ApiHideProperty()
  learnerName?: string;

  @ApiHideProperty()
  transactionId?: string;

  @ApiHideProperty()
  stripeCustomerId?: string;

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
