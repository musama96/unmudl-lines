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
const mailer_1 = require("@nest-modules/mailer");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const config_1 = require("../config/config");
const users_service_1 = require("../users/users.service");
const userTokens_service_1 = require("../users/userTokens.service");
const colleges_service_1 = require("../colleges/colleges.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let InvitationsService = class InvitationsService {
    constructor(invitationModel, mailerService, usersService, collegesService, userTokensService, emailLogsService) {
        this.invitationModel = invitationModel;
        this.mailerService = mailerService;
        this.usersService = usersService;
        this.collegesService = collegesService;
        this.userTokensService = userTokensService;
        this.emailLogsService = emailLogsService;
    }
    async inviteUser(invitation, token) {
        const { fullname, emailAddress, role, collegeId } = invitation;
        let newInvitation = new this.invitationModel(invitation);
        newInvitation = await newInvitation.save();
        const url = collegeId ? config_1.COLLEGE_USER_INVITATION_URL : config_1.USER_INVITATION_URL;
        const college = await this.collegesService.getCollegeById(collegeId);
        const mailData = {
            to: emailAddress,
            from: collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
            subject: collegeId ? `Invitation from ${college.data.title}` : 'Invitation from Unmudl',
            template: 'userInvitation',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                siteName: process.env.SITE_NAME,
                fullname,
                role: role[0].toUpperCase() + role.substring(1),
                emailAddress,
                token,
                url,
                college: college && college.data ? 'college: ' + college.data.title : 'unmudl',
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
        return ResponseHandler_1.default.success(newInvitation, responseMessages_1.default.success.invitationSent);
    }
    async resendInvitationEmail(invitationId) {
        try {
            const invitationData = await this.invitationModel
                .findById(invitationId)
                .lean()
                .exec();
            const user = await this.usersService.getUserByEmail(invitationData.emailAddress);
            const token = await this.userTokensService.createUserToken(user._id.toString());
            const url = user.collegeId ? config_1.COLLEGE_USER_INVITATION_URL : config_1.USER_INVITATION_URL;
            const { emailAddress, fullname, role } = invitationData;
            const college = await this.collegesService.getCollegeById(user.collegeId);
            const mailData = {
                to: emailAddress,
                from: user.collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
                subject: user.collegeId ? `Invitation from ${college.data.title}` : 'Invitation from Unmudl',
                template: 'userInvitation',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    siteName: process.env.SITE_NAME,
                    fullname,
                    role: role[0].toUpperCase() + role.substring(1),
                    emailAddress,
                    token,
                    url,
                    college: college && college.data ? 'college: ' + college.data.title : 'unmudl',
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
            return ResponseHandler_1.default.success({}, 'Email sent successfully');
        }
        catch (err) {
            return ResponseHandler_1.default.fail('Something went wrong', { err });
        }
    }
    async getInvitationByEmail(emailAddress) {
        const invite = await this.invitationModel
            .findOne({
            emailAddress,
        })
            .exec();
        return ResponseHandler_1.default.success(invite);
    }
    async getInvitationById(id) {
        const invitation = await this.invitationModel.findById(id).exec();
        return ResponseHandler_1.default.success(invitation);
    }
    async acceptInvitation(emailAddress) {
        const invite = await this.invitationModel
            .findOneAndUpdate({
            emailAddress,
        }, {
            $set: { status: 'accepted' },
        }, { new: true })
            .exec();
        return ResponseHandler_1.default.success(invite, responseMessages_1.default.success.invitationAccepted);
    }
    async deleteInvitation(invitationId) {
        await this.invitationModel.deleteOne({ _id: invitationId }).exec();
        return ResponseHandler_1.default.success({}, 'Invitation deleted successfully.');
    }
};
InvitationsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('invitations')),
    __metadata("design:paramtypes", [Object, mailer_1.MailerService,
        users_service_1.UsersService,
        colleges_service_1.CollegesService,
        userTokens_service_1.UserTokensService,
        email_logs_service_1.EmailLogsService])
], InvitationsService);
exports.InvitationsService = InvitationsService;
//# sourceMappingURL=invitations.service.js.map