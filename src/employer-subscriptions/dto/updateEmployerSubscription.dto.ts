import { IsMongoId } from '../../common/validators';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class UpdateEmployerSubscriptionDto {
  @IsMongoId(false, { message: responseMessages.common.invalidEmployerSubscriptionPlanId })
  plan?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidPromoId })
  promo?: string;

  priceStripeId?: string;

  card?: string;

  @ApiHideProperty()
  employer?: string;

  @ApiHideProperty()
  stripeCustomerId?: string;
}
