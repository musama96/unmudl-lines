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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("../config/config");
const mailer_1 = require("@nest-modules/mailer");
const mongoose = require("mongoose");
const functions_1 = require("../common/functions");
const ResponseHandler_1 = require("../common/ResponseHandler");
const json2csv = require("json2csv");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const employer_subscriptions_service_1 = require("../employer-subscriptions/employer-subscriptions.service");
const stripe_service_1 = require("../stripe/stripe.service");
const chat_service_1 = require("../chat/chat.service");
let EmployerInvitationsService = class EmployerInvitationsService {
    constructor(employerInvitationModel, counterModel, employerCompanyModel, employerAdminTokenModel, employerAdminModel, employerCompanyTokenModel, mailerService, emailLogsService, employerSubscriptionsService, stripeService, chatService) {
        this.employerInvitationModel = employerInvitationModel;
        this.counterModel = counterModel;
        this.employerCompanyModel = employerCompanyModel;
        this.employerAdminTokenModel = employerAdminTokenModel;
        this.employerAdminModel = employerAdminModel;
        this.employerCompanyTokenModel = employerCompanyTokenModel;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
        this.employerSubscriptionsService = employerSubscriptionsService;
        this.stripeService = stripeService;
        this.chatService = chatService;
    }
    async createInvitation(invitationData) {
        try {
            const counter = await this.counterModel
                .findOneAndUpdate({}, { $inc: { employer: 1, employerAdmin: 1 } }, { new: true, upsert: true })
                .lean();
            const customerId = await this.stripeService.createCustomer({
                emailAddress: invitationData.emailAddress,
                fullname: invitationData.fullname,
            });
            const employer = await this.employerCompanyModel.create({
                numId: counter.employer,
                title: invitationData.title,
                employerGroup: invitationData.group,
                isDomainSignup: invitationData.domainSignup,
                stripeCustomerId: customerId,
            });
            const token = await functions_1.default.getHash(employer._id.toString());
            const invitationToken = await this.employerCompanyTokenModel.create({
                employer: employer._id,
                token: encodeURIComponent(token),
            });
            invitationData.employerId = employer._id;
            const invitation = this.employerInvitationModel.create(invitationData);
            const admin = await this.employerAdminModel.create({
                emailAddress: invitationData.emailAddress,
                fullname: invitationData.fullname,
                employerId: employer._id,
                role: 'superadmin',
                invitation: 'pending',
                numId: counter.user,
            });
            const { data: employerSubscriptionPlan } = await this.employerSubscriptionsService.getEmployerSubscriptionPlanByLevel(0);
            await this.employerSubscriptionsService.updateEmployerSubscription({
                plan: employerSubscriptionPlan._id,
                priceStripeId: null,
                employer: employer._id,
                stripeCustomerId: customerId,
            });
            const url = config_1.EMPLOYER_INVITATION_URL;
            const text = `Dear ${invitationData.fullname}, \n  Your institue ${invitationData.title} have been invited to join unmudl.\n Click the following link to signup ${url}${encodeURIComponent(token)}.`;
            const mailData = {
                to: invitationData.emailAddress,
                from: process.env.PARTNER_NOREPLY_FROM,
                subject: 'Invitation from Unmudl',
                template: 'employerInvitation',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    siteName: process.env.SITE_NAME,
                    invitationData,
                    url,
                    token: encodeURIComponent(token),
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
            return ResponseHandler_1.default.success(invitation);
        }
        catch (err) {
            return ResponseHandler_1.default.fail('something went wrong', err);
        }
    }
    async resendInvitationEmail(invitationId) {
        try {
            const invitationData = await this.employerInvitationModel
                .findById(invitationId)
                .lean()
                .exec();
            const token = await functions_1.default.getHash(invitationData.employerId.toString());
            const invitationToken = await this.employerCompanyTokenModel.create({
                employer: invitationData.employerId,
                token: encodeURIComponent(token),
            });
            const url = config_1.EMPLOYER_INVITATION_URL;
            const mailData = {
                to: invitationData.emailAddress,
                from: process.env.PARTNER_NOREPLY_FROM,
                subject: 'Invitation from Unmudl',
                template: 'employerInvitation',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    siteName: process.env.SITE_NAME,
                    invitationData,
                    url,
                    token: encodeURIComponent(token),
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
            return ResponseHandler_1.default.success({}, 'Email sent successfully');
        }
        catch (err) {
            console.log(err);
            return ResponseHandler_1.default.fail('Something went wrong', { err });
        }
    }
    async updateAcceptedInvitation(employerId) {
        const employer = mongoose.Types.ObjectId(employerId);
        return await this.employerInvitationModel.findOneAndUpdate({ employerId: employer }, { status: 'accepted', date_accepted: new Date() }, { new: true });
    }
    async toggleSuspend(invitationId) {
        const invitation = await this.employerInvitationModel.findById(invitationId);
        invitation.isSuspended = invitation && invitation.status !== 'accepted' ? !invitation.isSuspended : invitation.isSuspended;
        await invitation.save();
        return ResponseHandler_1.default.success(invitation);
    }
    async checkExistingInvitationByEmployerName(collegeName) {
        return await this.employerInvitationModel
            .findOne({ title: collegeName })
            .lean()
            .exec();
    }
    async getEmployerInvitations(params) {
        const { page, perPage, keyword, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const [partners, rows] = await Promise.all([
            this.employerInvitationModel
                .find()
                .byTitle(keyword)
                .collation({ locale: 'en', strength: 2 })
                .sort(sort)
                .paginate(page, perPage)
                .populate('employerId', 'employerLogo employerLogoThumbnail')
                .lean()
                .exec(),
            this.employerInvitationModel.countDocuments({ title: { $regex: keyword, $options: 'i' } }),
        ]);
        return ResponseHandler_1.default.success({ partners, rows });
    }
    async getEmployerInvitationsCsv(params) {
        const { keyword, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const partners = await this.employerInvitationModel
            .aggregate([
            {
                $match: {
                    title: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
            },
            {
                $sort: sort,
            },
            {
                $project: {
                    'Employer Name': '$title',
                    'Employer Email': '$emailAddress',
                    'Date Invited': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                    Status: {
                        $concat: [
                            { $toUpper: { $substrCP: ['$status', 0, 1] } },
                            { $substrCP: ['$status', 1, { $subtract: [{ $strLenCP: '$status' }, 1] }] },
                        ],
                    },
                    'Date Signed Up': { $dateToString: { date: '$date_accepted', format: '%Y-%m-%d' } },
                },
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const fields = ['Employer Name', 'Employer Email', 'Date Invited', 'Status', 'Date Signed Up'];
        return json2csv.parse(partners, { fields });
    }
    async deleteInvitation(invitationId) {
        const employerInvitaion = await this.employerInvitationModel.findById(invitationId);
        if (!employerInvitaion || employerInvitaion.status !== 'pending') {
            return ResponseHandler_1.default.fail('Can not delete accepted invitation.');
        }
        await Promise.all([
            this.employerInvitationModel.deleteOne({ _id: mongoose.Types.ObjectId(employerInvitaion._id) }),
            this.employerAdminModel.deleteOne({ emailAddress: employerInvitaion.emailAddress }),
        ]);
        return ResponseHandler_1.default.success({}, 'Successfully deleted.');
    }
};
EmployerInvitationsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-invitations')),
    __param(1, mongoose_1.InjectModel('id-counters')),
    __param(2, mongoose_1.InjectModel('employer-companies')),
    __param(3, mongoose_1.InjectModel('employer-admin-tokens')),
    __param(4, mongoose_1.InjectModel('employer-admins')),
    __param(5, mongoose_1.InjectModel('employer-company-tokens')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, mailer_1.MailerService,
        email_logs_service_1.EmailLogsService,
        employer_subscriptions_service_1.EmployerSubscriptionsService,
        stripe_service_1.StripeService,
        chat_service_1.ChatService])
], EmployerInvitationsService);
exports.EmployerInvitationsService = EmployerInvitationsService;
//# sourceMappingURL=employer-invitations.service.js.map