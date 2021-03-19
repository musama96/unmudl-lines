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
const pagination_dto_1 = require("../common/dto/pagination.dto");
const employer_companies_service_1 = require("./employer-companies.service");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const employer_invitations_service_1 = require("../employer-invitations/employer-invitations.service");
const notifications_service_1 = require("../notifications/notifications.service");
let LearnersEmployerCompaniesController = class LearnersEmployerCompaniesController {
    constructor(employerCompaniesService, employerAdminsService, employerInvitationsService, notificationsService) {
        this.employerCompaniesService = employerCompaniesService;
        this.employerAdminsService = employerAdminsService;
        this.employerInvitationsService = employerInvitationsService;
        this.notificationsService = notificationsService;
    }
    async GetColleges(paginationDto) {
        paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
        paginationDto.page = Number(paginationDto.page) ? Number(paginationDto.page) : 1;
        paginationDto.perPage = Number(paginationDto.perPage) ? Number(paginationDto.perPage) : 6;
        paginationDto.collegeId = paginationDto.collegeId ? paginationDto.collegeId : null;
        return await this.employerCompaniesService.getEmployersList(paginationDto);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get list of colleges.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], LearnersEmployerCompaniesController.prototype, "GetColleges", null);
LearnersEmployerCompaniesController = __decorate([
    swagger_1.ApiTags('Learners Portal - Employers'),
    common_1.Controller('/learners/employer-companies'),
    __metadata("design:paramtypes", [employer_companies_service_1.EmployerCompaniesService,
        employer_admins_service_1.EmployerAdminsService,
        employer_invitations_service_1.EmployerInvitationsService,
        notifications_service_1.NotificationsService])
], LearnersEmployerCompaniesController);
exports.LearnersEmployerCompaniesController = LearnersEmployerCompaniesController;
//# sourceMappingURL=learners-employer-companies.controller.js.map