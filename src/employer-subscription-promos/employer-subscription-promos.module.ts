import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerSubscriptionPromosController } from './employer-subscription-promos.controller';
import { EmployerSubscriptionPromosService } from './employer-subscription-promos.service';
import { EmployerSubscriptionPromoSchema } from './employer-subscription-promo.model';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'employer-subscription-promos', schema: EmployerSubscriptionPromoSchema }]),
    forwardRef(() => StripeModule),
  ],
  controllers: [EmployerSubscriptionPromosController],
  providers: [EmployerSubscriptionPromosService],
  exports: [EmployerSubscriptionPromosService],
})
export class EmployerSubscriptionPromosModule {}
