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
const employer_invitations_service_1 = require("./employer-invitations.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const employer_invitation_dto_1 = require("./employer-invitation.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const collegeInvitationId_dto_1 = require("../college-invitations/dto/collegeInvitationId.dto");
let EmployerInvitationsController = class EmployerInvitationsController {
    constructor(employerInvitationsService, employerAdminsService) {
        this.employerInvitationsService = employerInvitationsService;
        this.employerAdminsService = employerAdminsService;
    }
    async InviteEmployer(employerInvitationDto, user) {
        const existingInvitation = await this.employerInvitationsService.checkExistingInvitationByEmployerName(employerInvitationDto.title);
        if (existingInvitation) {
            return ResponseHandler_1.default.fail('Invitation by this employer name already exists.', { titleExists: 'title Exists' });
        }
        const { data: existingUser } = await this.employerAdminsService.getUserByEmail(employerInvitationDto.emailAddress.toLowerCase());
        if (existingUser) {
            return ResponseHandler_1.default.fail('Employer admin by this email already exists.', { emailExists: 'email Exists' });
        }
        employerInvitationDto.invitedBy = user._id;
        return await this.employerInvitationsService.createInvitation(employerInvitationDto);
    }
    async GetEmployerInvites(paginationDto) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.employerInvitationsService.getEmployerInvitations(paginationDto);
    }
    async GetEmployerInvitesCsv(paginationDto) {
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.employerInvitationsService.getEmployerInvitationsCsv(paginationDto);
    }
    async ResendCollegeInvite(collegeInvitationIdDto) {
        return await this.employerInvitationsService.resendInvitationEmail(collegeInvitationIdDto.invitationId);
    }
    async SuspendUnsuspendCollegeInvite(collegeInvitationIdDto) {
        return await this.employerInvitationsService.toggleSuspend(collegeInvitationIdDto.invitationId);
    }
    async DeleteCollegeInvite(collegeInvitationIdDto) {
        return await this.employerInvitationsService.deleteInvitation(collegeInvitationIdDto.invitationId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Invite employer to unmudl.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employer_invitation_dto_1.EmployerInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerInvitationsController.prototype, "InviteEmployer", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get employer invites.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], EmployerInvitationsController.prototype, "GetEmployerInvites", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get list of college invites as csv.' }),
    common_1.Get('csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=College Invites.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], EmployerInvitationsController.prototype, "GetEmployerInvitesCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Resend college invitation mail.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('resend'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeInvitationId_dto_1.CollegeInvitationIdDto]),
    __metadata("design:returntype", Promise)
], EmployerInvitationsController.prototype, "ResendCollegeInvite", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Resend employer invitation mail.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('toggle-suspend'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeInvitationId_dto_1.CollegeInvitationIdDto]),
    __metadata("design:returntype", Promise)
], EmployerInvitationsController.prototype, "SuspendUnsuspendCollegeInvite", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Delete employer invitation.' }),
    common_1.Delete(':invitationId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeInvitationId_dto_1.CollegeInvitationIdDto]),
    __metadata("design:returntype", Promise)
], EmployerInvitationsController.prototype, "DeleteCollegeInvite", null);
EmployerInvitationsController = __decorate([
    swagger_1.ApiTags('Admin Portal - Employer Invitations'),
    common_1.Controller('employer-invitations'),
    __metadata("design:paramtypes", [employer_invitations_service_1.EmployerInvitationsService,
        employer_admins_service_1.EmployerAdminsService])
], EmployerInvitationsController);
exports.EmployerInvitationsController = EmployerInvitationsController;
//# sourceMappingURL=employer-invitations.controller.js.map