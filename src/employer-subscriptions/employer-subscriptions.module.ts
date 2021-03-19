import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollegesModule } from '../colleges/colleges.module';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';
import { EmployerSubscriptionPromoSchema } from '../employer-subscription-promos/employer-subscription-promo.model';
import { StripeModule } from '../stripe/stripe.module';
import { EmployerSubscriptionPlanSchema } from './employer-subscription-plan.model';
import { EmployerSubscriptionSchema } from './employer-subscription.model';
import { EmployerSubscriptionsWebhooksController } from './employer-subscriptions-webhooks.controller';
import { EmployerSubscriptionsController } from './employer-subscriptions.controller';
import { EmployerSubscriptionsService } from './employer-subscriptions.service';
import { EmployerAdminsModule } from '../employer-admins/employer-admins.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-companies', schema: EmployerCompanySchema },
      { name: 'employer-subscriptions', schema: EmployerSubscriptionSchema },
      { name: 'employer-subscription-plans', schema: EmployerSubscriptionPlanSchema },
      { name: 'employer-subscription-promos', schema: EmployerSubscriptionPromoSchema },
    ]),
    forwardRef(() => StripeModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => EmployerAdminsModule),
  ],
  controllers: [EmployerSubscriptionsController, EmployerSubscriptionsWebhooksController],
  providers: [EmployerSubscriptionsService],
  exports: [EmployerSubscriptionsService],
})
export class EmployerSubscriptionsModule {}
