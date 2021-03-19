import { IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class VerifyEmployerSubscriptionPromoDto {
  @IsNotEmpty({ message: responseMessages.createPromo.invalidPromo })
  title?: string;

  @IsNotEmpty()
  plan?: string;
}
