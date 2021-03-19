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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmployerSubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const ResponseHandler_1 = require("../common/ResponseHandler");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const stripe_service_1 = require("../stripe/stripe.service");
const defaultEmployerSubscriptionPlans_1 = require("./data/defaultEmployerSubscriptionPlans");
const schedule_1 = require("@nestjs/schedule");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const colleges_service_1 = require("../colleges/colleges.service");
let EmployerSubscriptionsService = EmployerSubscriptionsService_1 = class EmployerSubscriptionsService {
    constructor(stripeService, employerAdminsService, collegesService, employerModel, employerSubscriptionModel, employerSubscriptionPlanModel, employerSubscriptionPromoModel) {
        this.stripeService = stripeService;
        this.employerAdminsService = employerAdminsService;
        this.collegesService = collegesService;
        this.employerModel = employerModel;
        this.employerSubscriptionModel = employerSubscriptionModel;
        this.employerSubscriptionPlanModel = employerSubscriptionPlanModel;
        this.employerSubscriptionPromoModel = employerSubscriptionPromoModel;
        this.logger = new common_1.Logger(EmployerSubscriptionsService_1.name);
    }
    async updateEmployerSubscription(subscription) {
        const existingSubscription = await this.employerSubscriptionModel
            .findOne({
            status: 'active',
            employer: subscription.employer,
        })
            .populate('activePlan')
            .exec();
        const promo = subscription.promo ? await this.employerSubscriptionPromoModel.findById(subscription.promo).lean() : null;
        const plan = await this.employerSubscriptionPlanModel.findById(subscription.plan).lean();
        const { data: selectedPrice } = await this.stripeService.getProductPrice(subscription.priceStripeId);
        let isUpgrading = null;
        if (plan.level !== 0) {
            const isSubscribingMonthly = subscription.priceStripeId === plan.prices.monthly.stripeId;
            const isExistingMonthly = existingSubscription.activePriceInterval === 'month';
            const priceUpdate = isSubscribingMonthly === isExistingMonthly ? 'same' : isSubscribingMonthly && !isExistingMonthly ? 'downgrade' : 'upgrade';
            const isUpgradingPlan = plan.level === existingSubscription.activePlan.level
                ? 'same'
                : plan.level > existingSubscription.activePlan.level
                    ? 'upgrade'
                    : 'downgrade';
            if (isUpgradingPlan === 'upgrade' || (isUpgradingPlan === 'same' && priceUpdate === 'upgrade')) {
                isUpgrading = true;
            }
            else {
                isUpgrading = false;
            }
        }
        else {
            isUpgrading = false;
        }
        let stripeSubscriptionId = null;
        try {
            if (isUpgrading) {
                if (existingSubscription && existingSubscription.stripeSubscriptionId) {
                    const { data: stripeSubscription } = await this.stripeService.updateEmployerSubscription({
                        newPriceId: subscription.priceStripeId,
                        subscriptionId: existingSubscription.stripeSubscriptionId,
                        prorate: true,
                        coupon: promo ? promo.stripeTitle : null,
                        downgrade: false,
                    });
                    stripeSubscriptionId = stripeSubscription.id;
                }
                else if (subscription.card) {
                    const { data: stripeSubscription } = await this.stripeService.createEmployerSubscription({
                        price: subscription.priceStripeId,
                        customer: subscription.stripeCustomerId,
                        card: subscription.card,
                        coupon: promo ? promo.stripeTitle : null,
                    });
                    stripeSubscriptionId = stripeSubscription.id;
                }
                else {
                    return ResponseHandler_1.default.fail(`No existing paid subscription found. Need card id initiate new subscription.`);
                }
            }
            else {
                if (plan.level !== 0) {
                    const { data: stripeSubscription } = await this.stripeService.updateEmployerSubscription({
                        newPriceId: subscription.priceStripeId,
                        subscriptionId: existingSubscription.stripeSubscriptionId,
                        prorate: false,
                        coupon: promo ? promo.stripeTitle : null,
                        downgrade: true,
                    });
                    stripeSubscriptionId = stripeSubscription.id;
                }
            }
        }
        catch (e) {
            return ResponseHandler_1.default.fail(e.response ? e.response.message : e.message);
        }
        const newSubscriptionPlan = await this.employerSubscriptionPlanModel.findById(subscription.plan).exec();
        const basePrice = selectedPrice
            ? selectedPrice.recurring.interval === 'month'
                ? newSubscriptionPlan.prices.monthly.price
                : newSubscriptionPlan.prices.yearly.price
            : 0;
        const discountAmount = basePrice * (promo ? promo.percentage / 100 : 0);
        const totalPaid = basePrice - discountAmount;
        const newSubscription = await this.employerSubscriptionModel.create({
            employer: subscription.employer,
            activePlan: subscription.plan,
            activePlanSubscribedOn: new Date(),
            activeProductStripeId: plan.stripeProductId,
            activePriceStripeId: subscription.priceStripeId,
            activePriceInterval: selectedPrice ? selectedPrice.recurring.interval : '',
            activePlanExpiryDate: selectedPrice
                ? selectedPrice.recurring.interval === 'month'
                    ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                    : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                : null,
            stripeSubscriptionId,
            status: isUpgrading ? 'active' : existingSubscription ? 'pending' : 'active',
            prevSubscriptionPlan: existingSubscription ? existingSubscription.activePlan : null,
            prevSubscription: existingSubscription ? existingSubscription._id : null,
            firstSubscriptionPayment: totalPaid,
        });
        if (existingSubscription) {
            if (isUpgrading) {
                existingSubscription.status = 'changed-plan';
                existingSubscription.expiredOn = new Date();
            }
            if (newSubscriptionPlan.level > existingSubscription.activePlan.level) {
                await this.employerAdminsService.unSuspendAdditionalAdmins(subscription.employer, newSubscription.accountLimit);
            }
            existingSubscription.nextSubscriptionPlan = subscription.plan;
            existingSubscription.nextSubscription = newSubscription._id;
            await existingSubscription.save();
        }
        return ResponseHandler_1.default.success(newSubscription, 'Your subscription was updated successfully.');
    }
    async subscriptionInvoicePaymentFailed(invoice) {
        const subscription = await this.employerSubscriptionModel.findOne({ stripeSubscriptionId: invoice.subscription }).exec();
        if (subscription.status === 'active') {
            const localPlan = await this.employerSubscriptionPlanModel.findOne({ level: 0 }).lean();
            subscription.status = 'expired-payment-failed';
            const [newSubscription, canceledSubscription] = await Promise.all([
                this.employerSubscriptionModel.create({
                    employer: subscription.employer,
                    activePlan: localPlan._id,
                    activePlanSubscribedOn: new Date(),
                    activeProductStripeId: null,
                    activePriceStripeId: subscription.priceStripeId,
                    activePriceInterval: 'month',
                    activePlanExpiryDate: null,
                    stripeSubscriptionId: null,
                    status: 'active',
                    prevSubscriptionPlan: subscription.activePlan,
                    prevSubscription: subscription._id,
                }),
                await subscription.save(),
            ]);
            await this.employerAdminsService.suspendAdditionalAdmins(subscription.employer, localPlan.accountLimit);
            return ResponseHandler_1.default.success({ newSubscription, canceledSubscription });
        }
        else if (subscription.status === 'expired-payment-failed') {
            return ResponseHandler_1.default.success(null, 'Already canceled.');
        }
        else {
            this.logger.error(`Subscription payment failed: ${subscription._id.toString()}`);
            this.logger.error(`Subscription status: ${subscription.status}`);
            return ResponseHandler_1.default.fail('Invalid subscription status.');
        }
    }
    async subscriptionInvoicePaymentSucceeded(invoice) {
        let subscription = await this.employerSubscriptionModel
            .findOne({
            stripeSubscriptionId: invoice.subscription,
            status: 'active',
        })
            .populate('activePlan')
            .exec();
        if (subscription) {
            if (subscription.nextSubscription) {
                const nextSubscription = await this.employerSubscriptionModel
                    .findById(subscription.nextSubscription)
                    .populate('activePlan')
                    .exec();
                const { data: selectedPrice } = await this.stripeService.getProductPrice(nextSubscription.priceStripeId);
                if (nextSubscription.status === 'pending') {
                    nextSubscription.activePlanExpiryDate = selectedPrice
                        ? selectedPrice.recurring.interval === 'month'
                            ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                            : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                        : null;
                    nextSubscription.status = 'active';
                    nextSubscription.prevSubscriptionPlan = subscription.activePlan._id;
                    nextSubscription.prevSubscription = subscription._id;
                    subscription.status = 'changed-plan';
                    subscription.expiredOn = new Date();
                    if (subscription.activePlan.level > nextSubscription.activePlan.level) {
                        await this.employerAdminsService.suspendAdditionalAdmins(nextSubscription.employer, nextSubscription.activePlan.accountLimit);
                    }
                    else if (subscription.activePlan.level < nextSubscription.activePlan.level) {
                        await this.employerAdminsService.unSuspendAdditionalAdmins(nextSubscription.employer, nextSubscription.activePlan.accountLimit);
                    }
                    await Promise.all([nextSubscription.save(), subscription.save()]);
                }
                else {
                    this.logger.warn('Employer subscription payment succeeded webhook');
                    this.logger.warn(`Next subscription exists but it's status is "${nextSubscription.status}"`);
                    this.logger.warn(`Subscription: ${subscription._id.toString()}`);
                    this.logger.warn(`Next Subscription: ${nextSubscription._id.toString()}`);
                    return ResponseHandler_1.default.fail('Next subscription status is not correct.');
                }
            }
            else {
                const { data: selectedPrice } = await this.stripeService.getProductPrice(subscription.priceStripeId);
                subscription.activePlanExpiryDate = selectedPrice
                    ? selectedPrice.recurring.interval === 'month'
                        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                        : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    : null;
                await subscription.save();
            }
        }
        else {
            subscription = await this.employerSubscriptionModel
                .findOne({ stripeSubscriptionId: invoice.subscription })
                .populate('activePlan')
                .exec();
            const activeSubscription = await this.employerSubscriptionModel.findById(subscription.prevSubscription).exec();
            if (subscription) {
                const { data: selectedPrice } = await this.stripeService.getProductPrice(subscription.priceStripeId);
                this.logger.log(`Re-activating subscription: ${subscription._id.toString()}`);
                this.logger.log(`Subscription status: ${subscription.status} `);
                subscription.activePlanExpiryDate = selectedPrice
                    ? selectedPrice.recurring.interval === 'month'
                        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                        : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    : null;
                subscription.status = 'active';
                activeSubscription.status = 'canceled-by-system';
                await this.employerAdminsService.unSuspendAdditionalAdmins(subscription.employer, subscription.activePlan.accountLimit);
                await Promise.all([subscription.save(), activeSubscription.save()]);
            }
            else {
                this.logger.error(`Subscription does not exist: ${invoice.subscription}`);
                return ResponseHandler_1.default.fail('Subscription does not exist');
            }
        }
        return ResponseHandler_1.default.success(subscription);
    }
    async updateCollegeOrState(updateCollegeOrStateDto) {
        let subscription = await this.employerSubscriptionModel.findByIdAndUpdate(updateCollegeOrStateDto.subscription, {
            $set: {
                connectedCollege: updateCollegeOrStateDto.college ? updateCollegeOrStateDto.college : null,
                connectedState: updateCollegeOrStateDto.state ? updateCollegeOrStateDto.state : null,
                lastCollegeUpdated: updateCollegeOrStateDto.college ? new Date() : null,
                lastStateUpdated: updateCollegeOrStateDto.state ? new Date() : null,
            },
        }, { new: true });
        subscription = await subscription
            .populate('connectedCollege', 'title numId city state zip coordinates streetAddress collegeLogo collegeLogoThumbnail')
            .populate('activePlan')
            .execPopulate();
        if (subscription.activePlan.level !== 0) {
            const { data: colleges } = await this.collegesService.getCollegesByStateShortNameForEmployerSubscriptions(subscription.connectedState ? subscription.connectedState.shortName : '');
            subscription.connectedColleges = colleges;
        }
        else {
            subscription.connectedColleges = subscription.connectedCollege ? [subscription.connectedCollege] : [];
            delete subscription.connectedCollege;
        }
        return ResponseHandler_1.default.success(subscription, 'Subscription updated successfully.');
    }
    async getEmployerInvoices(user) {
        const { data: invoices } = await this.stripeService.getEmployerInvoices(user.stripeCustomerId);
        const data = await Promise.all(invoices.map(async (invoice) => {
            const subscription = await this.employerSubscriptionModel
                .findOne({ stripeSubscriptionId: invoice.subscription })
                .populate('activePlan')
                .lean();
            try {
                return {
                    number: invoice.number,
                    id: invoice.id,
                    pdfUrl: invoice.invoice_pdf,
                    hostedInvoiceUrl: invoice.hosted_invoice_url,
                    plan: subscription ? subscription.activePlan.title : 'N/A',
                    planLevel: subscription ? subscription.activePlan.level : 0,
                    interval: subscription ? subscription.activePriceInterval : 'month',
                    total: invoice.total / 100,
                    paymentTimestamp: invoice.created,
                    subscription: invoice.subscription,
                };
            }
            catch (e) {
                return ResponseHandler_1.default.success(e);
            }
        }));
        return ResponseHandler_1.default.success(data);
    }
    async initializeEmployerSubscriptionsIfDoesntExist() {
        const employers = await this.employerModel.aggregate([
            {
                $lookup: {
                    from: 'employer-subscriptions',
                    localField: '_id',
                    foreignField: 'employer',
                    as: 'subscriptions',
                },
            },
        ]);
        const { data: plan } = await this.getEmployerSubscriptionPlanByTitle('Local');
        const subscriptions = await Promise.all(employers.map(async (employer) => {
            if (!employer.subscriptions || (employer.subscriptions && employer.subscriptions.length === 0)) {
                return await this.employerSubscriptionModel.create({
                    employer: employer._id,
                    activePlan: plan._id,
                    activePlanSubscribedOn: new Date(),
                    activeProductStripeId: null,
                    activePriceStripeId: null,
                    activePriceInterval: 'month',
                    activePlanExpiryDate: null,
                    status: 'active',
                });
            }
            else {
                return 'Already subscribed';
            }
        }));
        return ResponseHandler_1.default.success(subscriptions);
    }
    async getActiveSubscription(employerId) {
        const subscription = await this.employerSubscriptionModel
            .findOne({ employer: employerId, status: 'active' })
            .populate('activePlan')
            .lean();
        if (subscription) {
            return ResponseHandler_1.default.success(subscription);
        }
        else {
            const { data: plan } = await this.getEmployerSubscriptionPlanByLevel(0);
            return ResponseHandler_1.default.success({
                employer: employerId,
                activePlan: plan,
                activePriceStripeId: null,
                activePriceInterval: null,
                activePlanSubscribedOn: null,
                activePlanExpiryDate: null,
                expiredOn: null,
                stripeSubscriptionId: null,
                status: 'active',
                connectedCollege: null,
                connectedState: null,
                lastCollegeUpdated: null,
                lastStateUpdated: null,
                firstSubscriptionPayment: 0,
            });
        }
    }
    async getEmployerCurrentSubscriptionPlan(employerId) {
        const plan = await this.employerSubscriptionModel
            .findOne({ employer: employerId, status: 'active' })
            .populate('activePlan')
            .populate('nextSubscriptionPlan')
            .populate('nextSubscription')
            .populate('connectedCollege')
            .exec();
        return ResponseHandler_1.default.success(plan);
    }
    async getEmployerSubscriptionPlanByTitle(title) {
        const plan = await this.employerSubscriptionPlanModel.findOne({ title }).lean();
        return ResponseHandler_1.default.success(plan);
    }
    async getEmployerSubscriptionPlanByLevel(level) {
        const plan = await this.employerSubscriptionPlanModel.findOne({ level }).lean();
        return ResponseHandler_1.default.success(plan);
    }
    async getEmployerSubscriptionPlans(user) {
        if (user && user.employerId) {
            const plans = await this.employerSubscriptionPlanModel
                .aggregate([
                {
                    $lookup: {
                        from: 'employer-subscriptions',
                        let: { planId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$activePlan', '$$planId'] },
                                            { $eq: ['$status', 'active'] },
                                            { $eq: ['$employer', mongoose.Types.ObjectId(user.employerId)] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: 'subscription',
                    },
                },
                {
                    $unwind: {
                        path: '$subscription',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'employer-subscriptions',
                        let: { nextPlanId: '$subscription.nextSubscription' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$nextPlanId'] } } },
                            {
                                $lookup: {
                                    from: 'employer-subscription-plans',
                                    localField: 'activePlan',
                                    foreignField: '_id',
                                    as: 'activePlan',
                                },
                            },
                            {
                                $unwind: {
                                    path: '$activePlan',
                                    preserveNullAndEmptyArrays: true,
                                },
                            },
                        ],
                        as: 'nextSubscription',
                    },
                },
                {
                    $unwind: {
                        path: '$nextSubscription',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $sort: { level: 1 } },
            ])
                .exec();
            return ResponseHandler_1.default.success(plans);
        }
        else {
            const plans = await this.employerSubscriptionPlanModel
                .find()
                .sort({ level: 1 })
                .lean();
            return ResponseHandler_1.default.success(plans);
        }
    }
    async initializeDefaultSubscriptionPlans() {
        const plans = await Promise.all(defaultEmployerSubscriptionPlans_1.defaultEmployerSubscriptionPlans.map(async (plan) => {
            const existingPlan = await this.employerSubscriptionPlanModel.findOne({ title: plan.title }).lean();
            if (!existingPlan || !existingPlan.stripeProductId) {
                const { data: stripePlan } = await this.stripeService.createProduct(plan);
                plan.stripeProductId = stripePlan.product ? stripePlan.product.id : null;
                plan.prices = {
                    monthly: plan.monthlyPrice > 0
                        ? {
                            stripeId: stripePlan.prices.monthly.id,
                            price: plan.monthlyPrice,
                        }
                        : null,
                    yearly: plan.yearlyPrice > 0
                        ? {
                            stripeId: stripePlan.prices.yearly.id,
                            price: plan.yearlyPrice,
                        }
                        : null,
                };
            }
            const newPlan = await this.employerSubscriptionPlanModel.findOneAndUpdate({ title: plan.title }, { $set: plan }, {
                upsert: true,
                new: true,
            });
            return newPlan;
        }));
        return ResponseHandler_1.default.success(plans, 'Plans initialized successfully.');
    }
    async subscriptionCycleCron() {
    }
};
__decorate([
    schedule_1.Cron(schedule_1.CronExpression.EVERY_2ND_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployerSubscriptionsService.prototype, "subscriptionCycleCron", null);
EmployerSubscriptionsService = EmployerSubscriptionsService_1 = __decorate([
    common_1.Injectable(),
    __param(3, mongoose_1.InjectModel('employer-companies')),
    __param(4, mongoose_1.InjectModel('employer-subscriptions')),
    __param(5, mongoose_1.InjectModel('employer-subscription-plans')),
    __param(6, mongoose_1.InjectModel('employer-subscription-promos')),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        employer_admins_service_1.EmployerAdminsService,
        colleges_service_1.CollegesService, Object, Object, Object, Object])
], EmployerSubscriptionsService);
exports.EmployerSubscriptionsService = EmployerSubscriptionsService;
//# sourceMappingURL=employer-subscriptions.service.js.map