import { Injectable, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CollegesService } from '../colleges/colleges.service';
import { User } from '../users/user.model';
import ResponseHandler from '../common/ResponseHandler';
import { STRIPE_SECRET_KEY } from '../config/config';
import { LearnersService } from '../learners/learners.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerCompaniesService } from '../employer-companies/employer-companies.service';
import { CreateEmployerSubscriptionPromoDto } from '../employer-subscription-promos/dto/createEmployerSubscription.dto';
import { StripeCoupon } from './stripe.types';

@Injectable()
export class StripeService {
  private readonly stripe = require('stripe')(STRIPE_SECRET_KEY);
  constructor(
    private readonly usersService: UsersService,
    private readonly learnersService: LearnersService,
    private readonly collegesService: CollegesService,
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly employerCompaniesService: EmployerCompaniesService,
  ) {}

  async addLearnerPaymentMethod(token, user) {
    try {
      if (!user.stripeCustomerId) {
        const stripeCustomerId = await this.createCustomer(user);

        if (stripeCustomerId) {
          await this.learnersService.updateStripeCustomerId(user._id, stripeCustomerId);
          user.stripeCustomerId = stripeCustomerId;
        } else {
          return ResponseHandler.fail('Customer could not be added to stripe. Please try again after a few minutes.');
        }
      }

      const newCard = await this.addCustomerCard(user.stripeCustomerId, token);
      return ResponseHandler.success(newCard);
    } catch (e) {
      return ResponseHandler.fail(e.raw.message);
    }
  }

  async getPaymentMethods(stripeCustomerId) {
    try {
      const response = await this.stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card' });

      const { data } = response;

      return ResponseHandler.success(data);
    } catch (e) {
      return ResponseHandler.fail(e.raw.message);
    }
  }

  async addCard(user: User, cardToken: string) {
    try {
      if (!user.stripeCustomerId) {
        const stripeCustomerId = await this.createCustomer(user);

        if (stripeCustomerId) {
          await this.usersService.updateStripeCustomerId(user._id, stripeCustomerId);

          const newCustomerCardCard = await this.addCustomerCard(stripeCustomerId, cardToken);
          return ResponseHandler.success(newCustomerCardCard);
        } else {
          return ResponseHandler.fail('Stripe add card failed.');
        }
      }

      const newCard = await this.addCustomerCard(user.stripeCustomerId, cardToken);
      return ResponseHandler.success(newCard);
    } catch (e) {
      return ResponseHandler.fail(e.raw.message);
    }
  }

  async addCardToEmployer(user, cardToken: string) {
    let newCard = null;
    if (!user.stripeCustomerId) {
      const { data: employer } = await this.employerCompaniesService.getEmployerById(user.employerId, false);
      if (!employer.stripeCustomerId) {
        try {
          const stripeCustomerId = await this.createCustomer(user);

          if (stripeCustomerId) {
            await this.employerAdminsService.updateStripeCustomerId(user._id, stripeCustomerId);

            newCard = await this.addCustomerCard(stripeCustomerId, cardToken);
          } else {
            return ResponseHandler.fail('Stripe add card failed.');
          }
        } catch (e) {
          return ResponseHandler.fail(e.raw.message);
        }
      } else {
        await this.employerAdminsService.updateStripeCustomerId(user._id, employer.stripeCustomerId);

        newCard = await this.addCustomerCard(employer.stripeCustomerId, cardToken);
      }
    } else {
      newCard = await this.addCustomerCard(user.stripeCustomerId, cardToken);
    }

    return ResponseHandler.success(newCard);
  }

  async getCards(user: User) {
    if (!user.stripeCustomerId) {
      return [];
    }
    const cards = await this.listCustomerCards(user.stripeCustomerId);
    return ResponseHandler.success(cards);
  }

  async createCustomer(user) {
    const newCustomer = await this.stripe.customers.create({
      email: user.emailAddress,
      phone: user.contactNumber ? user.contactNumber : null,
      name: user.fullname ? user.fullname : user.firstname + ' ' + user.lastname,
    });
    if (newCustomer && newCustomer.id) {
      return newCustomer.id;
    } else {
      return false;
    }
  }

  async addCustomerCard(stripeCustomerId: string, stripeToken: string) {
    return await this.stripe.customers.createSource(stripeCustomerId, {
      source: stripeToken,
    });
  }

  async removeCustomerCard(stripeCustomerId: string, cardId: string) {
    return await this.stripe.customers.deleteSource(stripeCustomerId, cardId);
  }

  async listCustomerCards(stripeCustomerId: string) {
    return await this.stripe.customers.listSources(stripeCustomerId);
  }

  async connectStripeAccount(user: User, authorizationCode: string) {
    const response = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code: authorizationCode,
    });
    if (response && response.stripe_user_id) {
      await this.collegesService.updateStripeId(user.collegeId, response.stripe_user_id);
    }
    return ResponseHandler.success(response.stripe_user_id);
  }

  async getStripeAccountDetails(stripeId: string) {
    // console.log('in getstripeaccountdetail');
    try {
      const response = await this.stripe.accounts.retrieve(stripeId);
      return response ? ResponseHandler.success(response) : { data: {} };
    } catch (err) {
      return ResponseHandler.success({});
    }
  }

  async createTransferOnConnectAccount(ConnectedStripeAccountId: string, amount: number, chargeId: string, description: string) {
    // Amount in stripe is always in cents
    try {
      const response = await this.stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: ConnectedStripeAccountId,
        source_transaction: chargeId,
        description,
      });
      return ResponseHandler.success(response);
    } catch (e) {
      return ResponseHandler.fail(e.raw.message);
    }
  }

  async createPayoutOnConnectAccount(ConnectedStripeAccountId: string, amount: number) {
    // Amount in stripe is always in cents
    try {
      const response = await this.stripe.payouts.create(
        {
          amount,
          currency: 'usd',
        },
        {
          stripe_account: ConnectedStripeAccountId,
        },
      );
      return ResponseHandler.success(response);
    } catch (e) {
      return ResponseHandler.fail(e && e.raw && e.raw.message ? e.raw.message : e);
    }
  }

  async getConnectAccountBalance(ConnectedStripeAccountId: string) {
    // console.log('in getconnectaccountbalance');
    try {
      const response = await this.stripe.balance.retrieve({
        stripeAccount: ConnectedStripeAccountId,
      });
      return response ? ResponseHandler.success(response) : { data: {} };
    } catch (err) {
      return ResponseHandler.fail(err.raw.message);
    }
  }

  async refundPaymentToCustomer(id, amount = null) {
    try {
      const refundParams = {
        charge: id,
      };
      if (amount) {
        // @ts-ignore
        refundParams.amount = amount;
      }
      const refund = await this.stripe.refunds.create(refundParams);

      return ResponseHandler.success(refund);
    } catch (e) {
      return ResponseHandler.fail(e.message);
    }
  }

  async reverseTransfer(id, amount = null) {
    let reversal = null;
    if (amount) {
      reversal = await this.stripe.transfers.createReversal(id, { amount });
    } else {
      reversal = await this.stripe.transfers.createReversal(id);
    }

    return ResponseHandler.success(reversal);
  }

  async capturePaymentFromCustomer(id) {
    try {
      const capture = await this.stripe.charges.capture(id);

      return ResponseHandler.success(capture);
    } catch (e) {
      return ResponseHandler.fail(e.message, null, 403);
    }
  }

  async createEmployerSubscription({ customer, price, card, coupon }) {
    const subscription = await this.stripe.subscriptions.create({
      customer,
      items: [{ price }],
      default_source: card,
      coupon,
    });

    return ResponseHandler.success(subscription);
  }

  async updateEmployerSubscription({ newPriceId, subscriptionId, prorate, coupon, downgrade }) {
    const oldSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    const update: {
      items: any;
      proration_behavior: string;
      coupon?: string;
      cancel_at_period_end?: boolean;
      trial_end?: any;
    } = {
      items: [{ price: newPriceId, id: oldSubscription.items.data[0].id }],
      proration_behavior: prorate ? 'create_prorations' : 'none',
    };

    if (coupon) {
      update.coupon = coupon;
    }
    if (downgrade) {
      update.cancel_at_period_end = false;
      update.proration_behavior = 'none';
      update.trial_end = oldSubscription.current_period_end;
    }

    const subscription = await this.stripe.subscriptions.update(subscriptionId, update);

    return ResponseHandler.success(subscription);
  }

  async cancelSubscription({ subscriptionId }) {
    await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

    return ResponseHandler.success(null, 'Subscription will be canceled at period end.');
  }

  async createSubscriptionPromo(promo: CreateEmployerSubscriptionPromoDto) {
    const stripeCoupon: StripeCoupon = {
      id: promo.stripeTitle,
      percent_off: promo.percentage,
      duration: promo.duration,
      currency: 'usd',
    };

    if (promo.maxUses) {
      stripeCoupon.max_redemptions = promo.maxUses;
    }

    if (promo.date && promo.date.end) {
      stripeCoupon.redeem_by = new Date(promo.date.end);
    }

    const coupon = await this.stripe.coupons.create(stripeCoupon);

    return ResponseHandler.success(coupon);
  }

  async getEmployerInvoices(customer) {
    const invoices = await this.stripe.invoices.list({
      limit: 3,
      customer,
    });

    return ResponseHandler.success(invoices ? invoices.data : []);
  }

  async getProductPrice(id) {
    if (id) {
      const price = await this.stripe.prices.retrieve(id);

      return ResponseHandler.success(price);
    } else {
      return ResponseHandler.success(null);
    }
  }

  async createProduct(plan) {
    let product = null;
    let monthlyPrice = null;
    let yearlyPrice = null;

    if (plan.monthlyPrice > 0 || plan.yearlyPrice > 0) {
      product = await this.stripe.products.create({
        name: plan.title,
        description: plan.description,
      });

      if (plan.monthlyPrice > 0) {
        monthlyPrice = await this.stripe.prices.create({
          unit_amount: Math.round(plan.monthlyPrice * 100),
          currency: 'usd',
          recurring: { interval: 'month' },
          product: product.id,
        });
      }

      if (plan.yearlyPrice > 0) {
        yearlyPrice = await this.stripe.prices.create({
          unit_amount: Math.round(plan.yearlyPrice * 100),
          currency: 'usd',
          recurring: { interval: 'year' },
          product: product.id,
        });
      }
    }

    return ResponseHandler.success(
      {
        product,
        prices: {
          monthly: monthlyPrice,
          yearly: yearlyPrice,
        },
      },
      'Created products on stripe.',
    );
  }
}
