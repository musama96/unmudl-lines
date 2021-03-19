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
const mailer_1 = require("@nest-modules/mailer");
const mongoose_1 = require("@nestjs/mongoose");
const functions_1 = require("../common/functions");
const config_1 = require("../config/config");
const ResponseHandler_1 = require("../common/ResponseHandler");
const mongoose = require("mongoose");
const json2csv = require("json2csv");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let CollegeInvitationsService = class CollegeInvitationsService {
    constructor(collegeModel, collegeTokenModel, collegeInvitaionsModel, counterModel, userModel, mailerService, emailLogsService) {
        this.collegeModel = collegeModel;
        this.collegeTokenModel = collegeTokenModel;
        this.collegeInvitaionsModel = collegeInvitaionsModel;
        this.counterModel = counterModel;
        this.userModel = userModel;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
    }
    async checkExistingInvitationByCollegeName(collegeName) {
        return await this.collegeInvitaionsModel
            .findOne({ title: collegeName })
            .lean()
            .exec();
    }
    async getCollegeInvitations(params) {
        const { page, perPage, keyword, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const [partners, rows] = await Promise.all([
            this.collegeInvitaionsModel
                .find()
                .byTitle(keyword)
                .collation({ locale: 'en', strength: 2 })
                .sort(sort)
                .paginate(page, perPage)
                .populate('collegeId', 'collegeLogo collegeLogoThumbnail')
                .lean()
                .exec(),
            this.collegeInvitaionsModel.countDocuments({ title: { $regex: keyword, $options: 'i' } }),
        ]);
        return ResponseHandler_1.default.success({ partners, rows });
    }
    async getCollegeInvitationsCsv(params) {
        const { keyword, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const partners = await this.collegeInvitaionsModel
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
                $lookup: {
                    from: 'colleges',
                    localField: 'collegeId',
                    foreignField: 'colleges',
                    as: 'college',
                },
            },
            {
                $sort: sort,
            },
            {
                $project: {
                    'Partner Name': '$title',
                    'Partner Email': '$emailAddress',
                    'Date Invited': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                    'Commission Percentage': { $concat: [{ $toString: '$commission' }, '%'] },
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
        const fields = ['Partner Name', 'Partner Email', 'Date Invited', 'Commission Percentage', 'Status', 'Date Signed Up'];
        return json2csv.parse(partners, { fields });
    }
    async createInvitation(invitationData) {
        try {
            const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { college: 1, user: 1 } }, { new: true, upsert: true }).lean();
            const college = await this.collegeModel.create({
                numId: counter.college,
                title: invitationData.title,
                unmudlShare: invitationData.commission,
                contact: {
                    email: invitationData.emailAddress,
                    name: invitationData.fullname,
                },
                partnerGroup: invitationData.group,
                domain: invitationData.domainSignup
                    ? invitationData.emailAddress.substring(invitationData.emailAddress.lastIndexOf('@') + 1)
                    : null,
            });
            const token = await functions_1.default.getHash(college._id.toString());
            const invitationToken = await this.collegeTokenModel.create({
                college: college._id,
                token: encodeURIComponent(token),
            });
            invitationData.collegeId = college._id;
            const invitation = this.collegeInvitaionsModel.create(invitationData);
            const user = await this.userModel.create({
                emailAddress: invitationData.emailAddress,
                fullname: invitationData.fullname,
                collegeId: college._id,
                role: 'superadmin',
                invitation: 'pending',
                numId: counter.user,
            });
            const url = config_1.COLLEGE_INVITATION_URL;
            const mailData = {
                to: invitationData.emailAddress,
                from: process.env.PARTNER_NOREPLY_FROM,
                subject: 'Invitation from Unmudl',
                template: 'collegeInvitation',
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
    async updateAcceptedInvitation(collegeId) {
        const college = mongoose.Types.ObjectId(collegeId);
        return await this.collegeInvitaionsModel.findOneAndUpdate({ collegeId: college }, { status: 'accepted', date_accepted: new Date() }, { new: true });
    }
    async resendInvitationEmail(invitationId) {
        try {
            const invitationData = await this.collegeInvitaionsModel
                .findById(invitationId)
                .lean()
                .exec();
            const token = await functions_1.default.getHash(invitationData.collegeId.toString());
            const invitationToken = await this.collegeTokenModel.create({
                college: invitationData.collegeId,
                token: encodeURIComponent(token),
            });
            const url = config_1.COLLEGE_INVITATION_URL;
            const mailData = {
                to: invitationData.emailAddress,
                from: process.env.PARTNER_NOREPLY_FROM,
                subject: 'Invitation from Unmudl',
                template: 'collegeInvitation',
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
    async toggleSuspend(invitationId) {
        const invitation = await this.collegeInvitaionsModel.findById(invitationId);
        invitation.isSuspended = invitation && invitation.status !== 'accepted' ? !invitation.isSuspended : invitation.isSuspended;
        await invitation.save();
        return ResponseHandler_1.default.success(invitation);
    }
    async deleteInvitation(invitationId) {
        const collegeInvitaion = await this.collegeInvitaionsModel.findById(invitationId);
        if (!collegeInvitaion || collegeInvitaion.status !== 'pending') {
            return ResponseHandler_1.default.fail('Can not delete accepted invitation.');
        }
        await Promise.all([
            this.collegeInvitaionsModel.deleteOne({ _id: mongoose.Types.ObjectId(collegeInvitaion._id) }),
            this.userModel.deleteOne({ emailAddress: collegeInvitaion.emailAddress }),
        ]);
        return ResponseHandler_1.default.success({}, 'Successfully deleted.');
    }
};
CollegeInvitationsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('colleges')),
    __param(1, mongoose_1.InjectModel('collegetokens')),
    __param(2, mongoose_1.InjectModel('college-invitations')),
    __param(3, mongoose_1.InjectModel('id-counters')),
    __param(4, mongoose_1.InjectModel('users')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, mailer_1.MailerService,
        email_logs_service_1.EmailLogsService])
], CollegeInvitationsService);
exports.CollegeInvitationsService = CollegeInvitationsService;
//# sourceMappingURL=college-invitations.service.js.map