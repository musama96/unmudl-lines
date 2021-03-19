import { IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class CheckoutCartDto {
  @IsOptional({ message: 'You must enter a valid stripe card id.' })
  @IsString({ message: responseMessages.createEnrollment.stripeCustomerId })
  cardId?: string;

  deleteCard?: boolean;
}
