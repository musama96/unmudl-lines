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
const config_1 = require("../config/config");
const mongoose_1 = require("@nestjs/mongoose");
const mailer_1 = require("@nest-modules/mailer");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const mongoose = require("mongoose");
const json2csv = require("json2csv");
const employer_companies_service_1 = require("../employer-companies/employer-companies.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let EmployerAdminInvitationsService = class EmployerAdminInvitationsService {
    constructor(employerAdminModel, employerAdminInvitationModel, mailerService, employerCompaniesService, emailLogsService) {
        this.employerAdminModel = employerAdminModel;
        this.employerAdminInvitationModel = employerAdminInvitationModel;
        this.mailerService = mailerService;
        this.employerCompaniesService = employerCompaniesService;
        this.emailLogsService = emailLogsService;
    }
    async getAdminInvitations(params) {
        const { employerId, keyword, page, perPage, sortOrder, sortBy, status } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (employerId) {
            match.employerId = mongoose.Types.ObjectId(employerId);
        }
        if (status) {
            match.status = { $in: status };
        }
        const invitedAdmins = await this.employerAdminInvitationModel
            .aggregate([
            {
                $match: match,
            },
            { $sort: sort },
        ])
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const { data: rows } = await this.getAdminInvitationsRows(params);
        return ResponseHandler_1.default.success({
            invitedAdmins,
            rows,
        });
    }
    async getAdminInvitationsCsv(params) {
        const { employerId, keyword, sortOrder, sortBy, status } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (employerId) {
            match.employerId = mongoose.Types.ObjectId(employerId);
        }
        if (status) {
            match.status = { $in: status };
        }
        const invitedAdmins = await this.employerAdminInvitationModel
            .aggregate([
            {
                $match: match,
            },
            {
                $project: {
                    'Full Name': '$fullname',
                    'Email Address': '$emailAddress',
                    Role: '$role',
                    Status: '$status',
                },
            },
            { $sort: sort },
        ])
            .exec();
        const fields = ['Full Name', 'Email Address', 'Role', 'Status'];
        return json2csv.parse(invitedAdmins, { fields });
    }
    async getEmployerAdminInvitationCount(employer) {
        const count = await this.employerAdminInvitationModel.countDocuments({ employerId: employer, deletedAt: null }).lean();
        return ResponseHandler_1.default.success(count);
    }
    async getAdminInvitationsRows(params) {
        const { employerId, keyword } = params;
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
        };
        if (employerId) {
            match.employerId = mongoose.Types.ObjectId(employerId);
        }
        const rows = await this.employerAdminInvitationModel.countDocuments(match).exec();
        return ResponseHandler_1.default.success(rows);
    }
    async getInvitationById(id, lean = true) {
        let invitation = this.employerAdminInvitationModel.findById(id);
        if (lean) {
            invitation = await invitation.lean();
        }
        else {
            invitation = await invitation.exec();
        }
        return ResponseHandler_1.default.success(invitation);
    }
    async removeAdminInvitation(id) {
        const invitation = await this.employerAdminInvitationModel.findById(id).lean();
        if (invitation.status === 'pending') {
            await this.employerAdminInvitationModel.deleteOne({ _id: id }).exec();
            if (invitation.adminId) {
                await this.employerAdminModel.deleteOne({ _id: invitation.adminId }).exec();
                return ResponseHandler_1.default.success(null, 'Invitation and admin deleted successfully.');
            }
            else {
                return ResponseHandler_1.default.success(null, 'Invitation deleted successfully.');
            }
        }
        else {
            return ResponseHandler_1.default.fail('You cannot delete an accepted invitation');
        }
    }
    async inviteAdmin(invitation, token) {
        const { fullname, emailAddress, role, employerId } = invitation;
        let newInvitation = new this.employerAdminInvitationModel(invitation);
        newInvitation = await newInvitation.save();
        const employer = await this.employerCompaniesService.getEmployerById(employerId);
        const url = config_1.EMPLOYER_ADMIN_INVITATION_URL;
        const mailData = {
            to: emailAddress,
            from: process.env.PARTNER_NOREPLY_FROM,
            subject: `Invitation from ${employer.data.title}`,
            template: 'employerAdminInvitation',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                siteName: process.env.SITE_NAME,
                fullname,
                role: role[0].toUpperCase() + role.substring(1),
                emailAddress,
                token,
                url,
                employer: employer.data.title,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.EMPLOYER) : null;
        return ResponseHandler_1.default.success(newInvitation, responseMessages_1.default.success.invitationSent);
    }
    async resendInvitation({ fullname, role, emailAddress, employerId }, token) {
        const employer = await this.employerCompaniesService.getEmployerById(employerId);
        const mailData = {
            to: emailAddress,
            from: process.env.PARTNER_NOREPLY_FROM,
            subject: `Invitation from ${employer.data.title}`,
            template: 'employerAdminInvitation',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                siteName: process.env.SITE_NAME,
                fullname,
                role: role[0].toUpperCase() + role.substring(1),
                emailAddress,
                token,
                url: config_1.EMPLOYER_ADMIN_INVITATION_URL,
                employer: employer.data.title,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.EMPLOYER) : null;
        return ResponseHandler_1.default.success(null, responseMessages_1.default.success.invitationSent);
    }
    async acceptInvitation(emailAddress) {
        const invite = await this.employerAdminInvitationModel
            .findOneAndUpdate({ emailAddress }, { $set: { status: 'accepted' } }, { new: true })
            .exec();
        return ResponseHandler_1.default.success(invite, responseMessages_1.default.success.invitationAccepted);
    }
};
EmployerAdminInvitationsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-admins')),
    __param(1, mongoose_1.InjectModel('employer-admin-invitations')),
    __metadata("design:paramtypes", [Object, Object, mailer_1.MailerService,
        employer_companies_service_1.EmployerCompaniesService,
        email_logs_service_1.EmailLogsService])
], EmployerAdminInvitationsService);
exports.EmployerAdminInvitationsService = EmployerAdminInvitationsService;
//# sourceMappingURL=employer-admin-invitations.service.js.map