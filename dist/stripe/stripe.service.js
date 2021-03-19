"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const colleges_service_1 = require("../colleges/colleges.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const config_1 = require("../config/config");
const learners_service_1 = require("../learners/learners.service");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const employer_companies_service_1 = require("../employer-companies/employer-companies.service");
let StripeService = class StripeService {
    constructor(usersService, learnersService, collegesService, employerAdminsService, employerCompaniesService) {
        this.usersService = usersService;
        this.learnersService = learnersService;
        this.collegesService = collegesService;
        this.employerAdminsService = employerAdminsService;
        this.employerCompaniesService = employerCompaniesService;
        this.stripe = require('stripe')(config_1.STRIPE_SECRET_KEY);
    }
    async addLearnerPaymentMethod(token, user) {
        try {
            if (!user.stripeCustomerId) {
                const stripeCustomerId = await this.createCustomer(user);
                if (stripeCustomerId) {
                    await this.learnersService.updateStripeCustomerId(user._id, stripeCustomerId);
                    user.stripeCustomerId = stripeCustomerId;
                }
                else {
                    return ResponseHandler_1.default.fail('Customer could not be added to stripe. Please try again after a few minutes.');
                }
            }
            const newCard = await this.addCustomerCard(user.stripeCustomerId, token);
            return ResponseHandler_1.default.success(newCard);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.raw.message);
        }
    }
    async getPaymentMethods(stripeCustomerId) {
        try {
            const response = await this.stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card' });
            const { data } = response;
            return ResponseHandler_1.default.success(data);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.raw.message);
        }
    }
    async addCard(user, cardToken) {
        try {
            if (!user.stripeCustomerId) {
                const stripeCustomerId = await this.createCustomer(user);
                if (stripeCustomerId) {
                    await this.usersService.updateStripeCustomerId(user._id, stripeCustomerId);
                    const newCustomerCardCard = await this.addCustomerCard(stripeCustomerId, cardToken);
                    return ResponseHandler_1.default.success(newCustomerCardCard);
                }
                else {
                    return ResponseHandler_1.default.fail('Stripe add card failed.');
                }
            }
            const newCard = await this.addCustomerCard(user.stripeCustomerId, cardToken);
            return ResponseHandler_1.default.success(newCard);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.raw.message);
        }
    }
    async addCardToEmployer(user, cardToken) {
        let newCard = null;
        if (!user.stripeCustomerId) {
            const { data: employer } = await this.employerCompaniesService.getEmployerById(user.employerId, false);
            if (!employer.stripeCustomerId) {
                try {
                    const stripeCustomerId = await this.createCustomer(user);
                    if (stripeCustomerId) {
                        await this.employerAdminsService.updateStripeCustomerId(user._id, stripeCustomerId);
                        newCard = await this.addCustomerCard(stripeCustomerId, cardToken);
                    }
                    else {
                        return ResponseHandler_1.default.fail('Stripe add card failed.');
                    }
                }
                catch (e) {
                    return ResponseHandler_1.default.fail(e.raw.message);
                }
            }
            else {
                await this.employerAdminsService.updateStripeCustomerId(user._id, employer.stripeCustomerId);
                newCard = await this.addCustomerCard(employer.stripeCustomerId, cardToken);
            }
        }
        else {
            newCard = await this.addCustomerCard(user.stripeCustomerId, cardToken);
        }
        return ResponseHandler_1.default.success(newCard);
    }
    async getCards(user) {
        if (!user.stripeCustomerId) {
            return [];
        }
        const cards = await this.listCustomerCards(user.stripeCustomerId);
        return ResponseHandler_1.default.success(cards);
    }
    async createCustomer(user) {
        const newCustomer = await this.stripe.customers.create({
            email: user.emailAddress,
            phone: user.contactNumber ? user.contactNumber : null,
            name: user.fullname ? user.fullname : user.firstname + ' ' + user.lastname,
        });
        if (newCustomer && newCustomer.id) {
            return newCustomer.id;
        }
        else {
            return false;
        }
    }
    async addCustomerCard(stripeCustomerId, stripeToken) {
        return await this.stripe.customers.createSource(stripeCustomerId, {
            source: stripeToken,
        });
    }
    async removeCustomerCard(stripeCustomerId, cardId) {
        return await this.stripe.customers.deleteSource(stripeCustomerId, cardId);
    }
    async listCustomerCards(stripeCustomerId) {
        return await this.stripe.customers.listSources(stripeCustomerId);
    }
    async connectStripeAccount(user, authorizationCode) {
        const response = await this.stripe.oauth.token({
            grant_type: 'authorization_code',
            code: authorizationCode,
        });
        if (response && response.stripe_user_id) {
            await this.collegesService.updateStripeId(user.collegeId, response.stripe_user_id);
        }
        return ResponseHandler_1.default.success(response.stripe_user_id);
    }
    async getStripeAccountDetails(stripeId) {
        try {
            const response = await this.stripe.accounts.retrieve(stripeId);
            return response ? ResponseHandler_1.default.success(response) : { data: {} };
        }
        catch (err) {
            return ResponseHandler_1.default.success({});
        }
    }
    async createTransferOnConnectAccount(ConnectedStripeAccountId, amount, chargeId, description) {
        try {
            const response = await this.stripe.transfers.create({
                amount,
                currency: 'usd',
                destination: ConnectedStripeAccountId,
                source_transaction: chargeId,
                description,
            });
            return ResponseHandler_1.default.success(response);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.raw.message);
        }
    }
    async createPayoutOnConnectAccount(ConnectedStripeAccountId, amount) {
        try {
            const response = await this.stripe.payouts.create({
                amount,
                currency: 'usd',
            }, {
                stripe_account: ConnectedStripeAccountId,
            });
            return ResponseHandler_1.default.success(response);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e && e.raw && e.raw.message ? e.raw.message : e);
        }
    }
    async getConnectAccountBalance(ConnectedStripeAccountId) {
        try {
            const response = await this.stripe.balance.retrieve({
                stripeAccount: ConnectedStripeAccountId,
            });
            return response ? ResponseHandler_1.default.success(response) : { data: {} };
        }
        catch (err) {
            return ResponseHandler_1.default.fail(err.raw.message);
        }
    }
    async refundPaymentToCustomer(id, amount = null) {
        try {
            const refundParams = {
                charge: id,
            };
            if (amount) {
                refundParams.amount = amount;
            }
            const refund = await this.stripe.refunds.create(refundParams);
            return ResponseHandler_1.default.success(refund);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.message);
        }
    }
    async reverseTransfer(id, amount = null) {
        let reversal = null;
        if (amount) {
            reversal = await this.stripe.transfers.createReversal(id, { amount });
        }
        else {
            reversal = await this.stripe.transfers.createReversal(id);
        }
        return ResponseHandler_1.default.success(reversal);
    }
    async capturePaymentFromCustomer(id) {
        try {
            const capture = await this.stripe.charges.capture(id);
            return ResponseHandler_1.default.success(capture);
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.message, null, 403);
        }
    }
    async createEmployerSubscription({ customer, price, card, coupon }) {
        const subscription = await this.stripe.subscriptions.create({
            customer,
            items: [{ price }],
            default_source: card,
            coupon,
        });
        return ResponseHandler_1.default.success(subscription);
    }
    async updateEmployerSubscription({ newPriceId, subscriptionId, prorate, coupon, downgrade }) {
        const oldSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        const update = {
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
        return ResponseHandler_1.default.success(subscription);
    }
    async cancelSubscription({ subscriptionId }) {
        await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
        return ResponseHandler_1.default.success(null, 'Subscription will be canceled at period end.');
    }
    async createSubscriptionPromo(promo) {
        const stripeCoupon = {
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
        return ResponseHandler_1.default.success(coupon);
    }
    async getEmployerInvoices(customer) {
        const invoices = await this.stripe.invoices.list({
            limit: 3,
            customer,
        });
        return ResponseHandler_1.default.success(invoices ? invoices.data : []);
    }
    async getProductPrice(id) {
        if (id) {
            const price = await this.stripe.prices.retrieve(id);
            return ResponseHandler_1.default.success(price);
        }
        else {
            return ResponseHandler_1.default.success(null);
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
        return ResponseHandler_1.default.success({
            product,
            prices: {
                monthly: monthlyPrice,
                yearly: yearlyPrice,
            },
        }, 'Created products on stripe.');
    }
};
StripeService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        learners_service_1.LearnersService,
        colleges_service_1.CollegesService,
        employer_admins_service_1.EmployerAdminsService,
        employer_companies_service_1.EmployerCompaniesService])
], StripeService);
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map