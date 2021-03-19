import { IsMongoId } from '../../common/validators';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class CreateEmployerSubscriptionDto {
  @IsMongoId(false, { message: responseMessages.common.invalidEmployerSubscriptionPlanId })
  plan?: string;

  @IsNotEmpty({ message: responseMessages.createEmployerSubscription.priceStripeId })
  priceStripeId?: string;

  @IsNotEmpty({ message: responseMessages.createEmployerSubscription.stripeCardId })
  card?: string;

  @ApiHideProperty()
  employer?: string;

  @ApiHideProperty()
  stripeCustomerId?: string;
}
