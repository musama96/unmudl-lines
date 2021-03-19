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
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const mongoose = require("mongoose");
const json2csv = require("json2csv");
const user_model_1 = require("../users/user.model");
const moment = require("moment");
const mailer_1 = require("@nest-modules/mailer");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let PartnerRequestsService = class PartnerRequestsService {
    constructor(partnerRequestModel, userModel, mailerService, emailLogsService) {
        this.partnerRequestModel = partnerRequestModel;
        this.userModel = userModel;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
    }
    async checkPartnerRequest(collegeName) {
        const request = await this.partnerRequestModel
            .findOne({ collegeName, status: 'pending' })
            .lean()
            .exec();
        return !!request;
    }
    async createPartnerRequest(collegeRequest) {
        let newCollegeRequest = new this.partnerRequestModel(collegeRequest);
        newCollegeRequest = await newCollegeRequest.save();
        const mailData = {
            to: process.env.PARTNER_WITH_UNMUDL_MAIL,
            from: process.env.ADMIN_NOTIFICATION_FROM,
            subject: 'Unmudl Notification',
            template: 'partnerRequestMail',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                date: moment(new Date()).format('LL'),
                partnerRequest: collegeRequest,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
        const unmudlSuperAdmin = await this.userModel.find({ collegeId: null, role: user_model_1.UserRoles.SUPERADMIN, 'notifications.email': true }, 'emailAddress')
            .lean().exec();
        if (unmudlSuperAdmin && unmudlSuperAdmin.length > 0) {
            for (let i = 0; i < unmudlSuperAdmin.length; i++) {
                setTimeout(async () => {
                    const mailData = {
                        to: unmudlSuperAdmin[i].emailAddress,
                        from: process.env.ADMIN_NOTIFICATION_FROM,
                        subject: 'UNMUDL Notification',
                        template: 'partnerRequestMail',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            partnerRequest: collegeRequest,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                }, 1000);
            }
        }
        return ResponseHandler_1.default.success(newCollegeRequest);
    }
    async getPartnerRequests(params) {
        const { page, perPage, sortBy, sortOrder, keyword } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const [requests, rows] = await Promise.all([
            this.partnerRequestModel
                .aggregate([
                { $match: { collegeName: { $regex: keyword, $options: 'i' } } },
                { $sort: sort },
                { $skip: (page - 1) * perPage },
                { $limit: perPage },
            ])
                .collation({ locale: 'en', strength: 2 })
                .exec(),
            this.partnerRequestModel.countDocuments({ collegeName: { $regex: keyword, $options: 'i' } }),
        ]);
        return ResponseHandler_1.default.success({ requests, rows });
    }
    async getPartnerRequestsCsv(params) {
        const { sortBy, sortOrder, keyword } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const requests = await this.partnerRequestModel
            .aggregate([
            { $match: { collegeName: { $regex: keyword, $options: 'i' } } },
            { $sort: sort },
            {
                $project: {
                    'Name of Contact': '$contactPerson',
                    'Community College': '$collegeName',
                    'Contact Email': '$email',
                    'Contact Phone Number': { $concat: ['"', '$phoneNumber', '"'] },
                    Status: {
                        $concat: [
                            { $toUpper: { $substrCP: ['$status', 0, 1] } },
                            { $substrCP: ['$status', 1, { $subtract: [{ $strLenCP: '$status' }, 1] }] },
                        ],
                    },
                    'Request Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                },
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const fields = ['Name of Contact', 'Community College', 'Contact Email', 'Contact Phone Number', 'Status', 'Request Date'];
        return json2csv.parse(requests, { fields });
    }
    async getPartnerRequestDetails(id) {
        const request = await this.partnerRequestModel.findById(id).lean();
        return ResponseHandler_1.default.success(request);
    }
    async updatePartnerRequestStatus({ partnerRequestId, status }) {
        const request = await this.partnerRequestModel
            .findByIdAndUpdate(partnerRequestId, {
            $set: { status },
        }, { new: true })
            .lean();
        return ResponseHandler_1.default.success(request, responseMessages_1.default.success.updatePartnerRequestStatus(status));
    }
    async deletePartnerRequest(requestId) {
        try {
            await this.partnerRequestModel.deleteOne({
                _id: mongoose.Types.ObjectId(requestId),
                status: { $in: ['pending', 'rejected'] },
            });
            return ResponseHandler_1.default.success('Successfully deleted.');
        }
        catch (err) {
            return ResponseHandler_1.default.fail('Can not delete an accepted request.');
        }
    }
};
PartnerRequestsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('partner-requests')),
    __param(1, mongoose_1.InjectModel('users')),
    __metadata("design:paramtypes", [Object, Object, mailer_1.MailerService,
        email_logs_service_1.EmailLogsService])
], PartnerRequestsService);
exports.PartnerRequestsService = PartnerRequestsService;
//# sourceMappingURL=partner-requests.service.js.map