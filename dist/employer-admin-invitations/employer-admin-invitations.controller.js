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
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const employer_admin_invitations_service_1 = require("./employer-admin-invitations.service");
const invite_employer_admin_dto_1 = require("./dto/invite-employer-admin.dto");
const list_dto_1 = require("../common/dto/list.dto");
const employerAdminInvitationId_dto_1 = require("../common/dto/employerAdminInvitationId.dto");
const responseMessages_1 = require("../config/responseMessages");
const ResponseHandler_1 = require("../common/ResponseHandler");
const stripe_service_1 = require("../stripe/stripe.service");
const chat_service_1 = require("../chat/chat.service");
let EmployerAdminInvitationsController = class EmployerAdminInvitationsController {
    constructor(employerAdminsService, employerAdminInvitationsService, stripeService, chatService) {
        this.employerAdminsService = employerAdminsService;
        this.employerAdminInvitationsService = employerAdminInvitationsService;
        this.stripeService = stripeService;
        this.chatService = chatService;
    }
    async getAdminInvitations(listDto, user) {
        listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        return await this.employerAdminInvitationsService.getAdminInvitations(listDto);
    }
    async getAdminInvitationsCsv(listDto, user) {
        listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        return await this.employerAdminInvitationsService.getAdminInvitationsCsv(listDto);
    }
    async removeAdminInvitation(employerAdminInvitationIdDto) {
        return await this.employerAdminInvitationsService.removeAdminInvitation(employerAdminInvitationIdDto.invitationId);
    }
    async inviteEmployerAdmin(inviteEmployerAdminDto, user) {
        inviteEmployerAdminDto.invitedBy = user._id;
        inviteEmployerAdminDto.employerId = user.employerId ? user.employerId : inviteEmployerAdminDto.employerId;
        const { data: invitedAdmins } = await this.employerAdminInvitationsService.getEmployerAdminInvitationCount(inviteEmployerAdminDto.employerId);
        const { subscription: { activePlan }, } = user;
        if ((activePlan.level === 0 || activePlan.level === 1) && invitedAdmins >= activePlan.accountLimit) {
            return ResponseHandler_1.default.fail(`You have reached you plan's account limit. You cannot invite more admins.`);
        }
        const existingAdmin = await this.employerAdminsService.getAdminByEmail(inviteEmployerAdminDto.emailAddress.toLowerCase());
        if (existingAdmin) {
            return ResponseHandler_1.default.fail((existingAdmin.employerId ? existingAdmin.employerId.toString() : '') === (user.employerId ? user.employerId.toString() : '')
                ? responseMessages_1.default.inviteEmployerAdmin.adminAlreadyRegistered
                : 'Admin already registered with another employer.');
        }
        if (inviteEmployerAdminDto.role === invite_employer_admin_dto_1.EmployerAdminRole.SUPERADMIN && user.role !== invite_employer_admin_dto_1.EmployerAdminRole.SUPERADMIN) {
            return ResponseHandler_1.default.fail('Only a super admin can add another super admin.');
        }
        let { data: newAdmin } = await this.employerAdminsService.insertInvitedAdmin(inviteEmployerAdminDto);
        newAdmin = await newAdmin.populate('employerId').execPopulate();
        if (newAdmin.employerId.stripeCustomerId) {
            newAdmin.stripeCustomerId = newAdmin.employerId.stripeCustomerId;
        }
        else {
            const customerId = await this.stripeService.createCustomer(newAdmin);
            newAdmin.stripeCustomerId = customerId;
            newAdmin.employerId.stripeCustomerId = customerId;
            await newAdmin.employerId.save();
        }
        await newAdmin.save();
        const token = await this.employerAdminsService.createEmployerAdminToken(newAdmin._id.toString());
        inviteEmployerAdminDto.employerAdminId = newAdmin._id;
        const { data: invitation } = await this.employerAdminInvitationsService.inviteAdmin(inviteEmployerAdminDto, token);
        return ResponseHandler_1.default.success({
            invitation,
        });
    }
    async resendInvitation(employerAdminInvitationIdDto) {
        const { data: invitation } = await this.employerAdminInvitationsService.getInvitationById(employerAdminInvitationIdDto.invitationId);
        if (invitation.status === 'pending') {
            if (invitation.employerAdminId) {
                const token = await this.employerAdminsService.createEmployerAdminToken(invitation.employerAdminId.toString());
                await this.employerAdminInvitationsService.resendInvitation(invitation, token);
                return ResponseHandler_1.default.success(null, 'Invitation resent successfully.');
            }
            else {
                return ResponseHandler_1.default.fail('Admin id is missing from the database. Please delete the user and invite him again.');
            }
        }
        else {
            return ResponseHandler_1.default.fail('Admin already accepted invitation.');
        }
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get employer admin invitations list' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminInvitationsController.prototype, "getAdminInvitations", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get employer admin invitations list' }),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=Employer Admin Invitations.csv'),
    common_1.Get('csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminInvitationsController.prototype, "getAdminInvitationsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Delete employer admin invitation.' }),
    common_1.Delete(':invitationId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAdminInvitationId_dto_1.EmployerAdminInvitationIdDto]),
    __metadata("design:returntype", Promise)
], EmployerAdminInvitationsController.prototype, "removeAdminInvitation", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Invite employer admin.' }),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invite_employer_admin_dto_1.InviteEmployerAdminDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminInvitationsController.prototype, "inviteEmployerAdmin", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Resend employer admin invitation.' }),
    common_1.Post('resend'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAdminInvitationId_dto_1.EmployerAdminInvitationIdDto]),
    __metadata("design:returntype", Promise)
], EmployerAdminInvitationsController.prototype, "resendInvitation", null);
EmployerAdminInvitationsController = __decorate([
    swagger_1.ApiTags('Admin Portal - Employer Admin Invitations'),
    common_1.Controller('employer-admin-invitations'),
    __metadata("design:paramtypes", [employer_admins_service_1.EmployerAdminsService,
        employer_admin_invitations_service_1.EmployerAdminInvitationsService,
        stripe_service_1.StripeService,
        chat_service_1.ChatService])
], EmployerAdminInvitationsController);
exports.EmployerAdminInvitationsController = EmployerAdminInvitationsController;
//# sourceMappingURL=employer-admin-invitations.controller.js.map