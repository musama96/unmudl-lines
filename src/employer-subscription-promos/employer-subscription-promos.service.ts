import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import { StripeService } from '../stripe/stripe.service';
import { CreateEmployerSubscriptionPromoDto } from './dto/createEmployerSubscription.dto';
import { VerifyEmployerSubscriptionPromoDto } from './dto/verifyPromo.dto';

@Injectable()
export class EmployerSubscriptionPromosService {
  constructor(
    @InjectModel('employer-subscription-promos') private readonly employerSubscriptionPromoModel,
    private readonly stripeService: StripeService,
  ) {}

  async createEmployerSubscriptionPromo(promo: CreateEmployerSubscriptionPromoDto) {
    const newPromo = await this.employerSubscriptionPromoModel.create(promo);

    const { data: stripeCoupon } = await this.stripeService.createSubscriptionPromo(promo);

    return ResponseHandler.success({ newPromo, stripeCoupon });
  }

  async verifyPromo({ title, plan }: VerifyEmployerSubscriptionPromoDto) {
    const promos = await this.employerSubscriptionPromoModel.find({ title }).lean();
    let failureMessage = 'Promo not found.';

    if (promos && promos.length > 0) {
      for (let i = 0; i < promos.length; i++) {
        const promo = promos[i];
        if (
          (promo.maxUses && promo.maxUses === promo.used) ||
          (promo.date.start && new Date(promo.date.start) > new Date()) ||
          (promo.applyToPlans === 'selected' && !promo.plans.find(planId => planId.toString() === plan.toString())) ||
          promo.status === 'suspended'
        ) {
          failureMessage = 'Promo cannot be applied.';
          continue;
        }
        if (promo.date.end && new Date(promo.date.end) < new Date()) {
          failureMessage = 'Promo has expired.';
          continue;
        }

        return ResponseHandler.success({
          _id: promo._id,
          title: promo.title,
          percentage: promo.percentage,
          duration: promo.duration,
        });
      }
    }

    return ResponseHandler.fail(failureMessage);
  }
}
