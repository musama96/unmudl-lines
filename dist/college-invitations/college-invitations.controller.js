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
const college_invitations_service_1 = require("./college-invitations.service");
const swagger_1 = require("@nestjs/swagger");
const college_invitation_dto_1 = require("./dto/college-invitation.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const users_service_1 = require("../users/users.service");
const partner_requests_service_1 = require("../partner-requests/partner-requests.service");
const collegeInvitationId_dto_1 = require("./dto/collegeInvitationId.dto");
const employer_invitations_service_1 = require("../employer-invitations/employer-invitations.service");
const employer_requests_service_1 = require("../employer-requests/employer-requests.service");
let CollegeInvitationsController = class CollegeInvitationsController {
    constructor(collegeInvitationsService, usersService, partnerRequestsService, employerInvitationsService, employerRequestsService) {
        this.collegeInvitationsService = collegeInvitationsService;
        this.usersService = usersService;
        this.partnerRequestsService = partnerRequestsService;
        this.employerInvitationsService = employerInvitationsService;
        this.employerRequestsService = employerRequestsService;
    }
    async GetCollegeInvitesAndRequest(paginationDto) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        const invitationParams = Object.assign(Object.assign({}, paginationDto), { sortBy: 'title', sortOrder: '1' });
        const requestsParams = Object.assign(Object.assign({}, paginationDto), { sortBy: 'collegeName', sortOrder: '1' });
        const employerRequestsParams = Object.assign(Object.assign({}, paginationDto), { sortBy: 'employerName', sortOrder: '1' });
        const [invitedPartners, partnerRequests, invitedEmployers, employerRequests] = await Promise.all([
            this.collegeInvitationsService.getCollegeInvitations(invitationParams),
            this.partnerRequestsService.getPartnerRequests(requestsParams),
            this.employerInvitationsService.getEmployerInvitations(invitationParams),
            this.employerRequestsService.getEmployerRequests(employerRequestsParams),
        ]);
        return ResponseHandler_1.default.success({
            invitedPartners: invitedPartners.data,
            partnerRequests: partnerRequests.data,
            invitedEmployers: invitedEmployers.data,
            employerRequests: employerRequests.data,
        });
    }
    async GetCollegeInvites(paginationDto) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.collegeInvitationsService.getCollegeInvitations(paginationDto);
    }
    async GetCollegeInvitesCsv(paginationDto) {
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.collegeInvitationsService.getCollegeInvitationsCsv(paginationDto);
    }
    async InviteCollege(collegeInvitaionDto, user) {
        const existingInvitaion = await this.collegeInvitationsService.checkExistingInvitationByCollegeName(collegeInvitaionDto.title);
        if (existingInvitaion) {
            return ResponseHandler_1.default.fail('Invitation by this college name already exists.', { titleExists: 'title Exists' });
        }
        const existingUser = await this.usersService.checkIfEmailExists(collegeInvitaionDto.emailAddress.toLowerCase());
        if (existingUser.data) {
            return ResponseHandler_1.default.fail('User by this email already exists.', { emailExists: 'email Exists' });
        }
        collegeInvitaionDto.invitedBy = user._id;
        collegeInvitaionDto.domainSignup = collegeInvitaionDto.domainSignup ? collegeInvitaionDto.domainSignup : false;
        return await this.collegeInvitationsService.createInvitation(collegeInvitaionDto);
    }
    async ResendCollegeInvite(collegeInvitationIdDto) {
        return await this.collegeInvitationsService.resendInvitationEmail(collegeInvitationIdDto.invitationId);
    }
    async SuspendUnsuspendCollegeInvite(collegeInvitationIdDto) {
        return await this.collegeInvitationsService.toggleSuspend(collegeInvitationIdDto.invitationId);
    }
    async DeleteCollegeInvite(collegeInvitationIdDto) {
        return await this.collegeInvitationsService.deleteInvitation(collegeInvitationIdDto.invitationId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'get paginated list of college invites.' }),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CollegeInvitationsController.prototype, "GetCollegeInvitesAndRequest", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'get paginated list of college invites.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CollegeInvitationsController.prototype, "GetCollegeInvites", null);
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
], CollegeInvitationsController.prototype, "GetCollegeInvitesCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Invite college to unmudl.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [college_invitation_dto_1.CollegeInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], CollegeInvitationsController.prototype, "InviteCollege", null);
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
], CollegeInvitationsController.prototype, "ResendCollegeInvite", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Resend college invitation mail.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('toggle-suspend'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeInvitationId_dto_1.CollegeInvitationIdDto]),
    __metadata("design:returntype", Promise)
], CollegeInvitationsController.prototype, "SuspendUnsuspendCollegeInvite", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Resend college invitation mail.' }),
    common_1.Delete(':invitationId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeInvitationId_dto_1.CollegeInvitationIdDto]),
    __metadata("design:returntype", Promise)
], CollegeInvitationsController.prototype, "DeleteCollegeInvite", null);
CollegeInvitationsController = __decorate([
    swagger_1.ApiTags('College Invitations'),
    common_1.Controller('college-invitations'),
    __metadata("design:paramtypes", [college_invitations_service_1.CollegeInvitationsService,
        users_service_1.UsersService,
        partner_requests_service_1.PartnerRequestsService,
        employer_invitations_service_1.EmployerInvitationsService,
        employer_requests_service_1.EmployerRequestsService])
], CollegeInvitationsController);
exports.CollegeInvitationsController = CollegeInvitationsController;
//# sourceMappingURL=college-invitations.controller.js.map