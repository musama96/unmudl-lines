import { IsMongoId } from '../../common/validators';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class GiftCourseDto {
  @ApiProperty({ required: false })
  @IsEmail({}, { message: responseMessages.giftCourse.email })
  recipientEmail?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty({ message: responseMessages.giftCourse.name })
  recipientName?: string;

  @ApiProperty({ required: false })
  @IsNotEmpty({ message: responseMessages.giftCourse.message })
  message: string;

  @ApiProperty({ required: false })
  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  courseId?: string;

  @ApiProperty({ required: false })
  @IsMongoId(true, { message: responseMessages.common.invalidPromoId })
  promoId?: string;

  @ApiProperty({ required: false })
  cardId?: string;

  @ApiHideProperty()
  recipientId?: string;

  @ApiHideProperty()
  senderId?: string;

  @ApiHideProperty()
  senderName?: string;

  @ApiHideProperty()
  senderEmail?: string;

  @ApiHideProperty()
  stripeCustomerId?: string;

  deleteCard?: boolean;

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

  @ApiHideProperty()
  transferId?: string;

  @ApiHideProperty()
  destPaymentId?: string;

  @ApiHideProperty()
  giftCode?: string;

  @ApiHideProperty()
  _id?: string;
}
