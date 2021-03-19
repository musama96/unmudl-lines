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
const employer_companies_service_1 = require("./employer-companies.service");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("../config/config");
const employer_invitations_service_1 = require("../employer-invitations/employer-invitations.service");
const notifications_service_1 = require("../notifications/notifications.service");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const sign_up_employer_dto_1 = require("./dto/sign-up-employer.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
const multer_1 = require("multer");
const sharp = require("sharp");
const token_dto_1 = require("../users/dto/token.dto");
const responseMessages_1 = require("../config/responseMessages");
const fs = require("fs");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const employerCompanyId_dto_1 = require("../common/dto/employerCompanyId.dto");
const update_employer_company_dto_1 = require("./dto/update-employer-company.dto");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
const stats_dto_1 = require("../colleges/dto/stats.dto");
const analyticsCount_dto_1 = require("../common/dto/analyticsCount.dto");
const list_dto_1 = require("../common/dto/list.dto");
const adminHomeDto_dto_1 = require("../colleges/dto/adminHomeDto.dto");
const json2csv = require("json2csv");
const s3_1 = require("../s3upload/s3");
const employer_admin_invitations_service_1 = require("../employer-admin-invitations/employer-admin-invitations.service");
const employer_subscriptions_service_1 = require("../employer-subscriptions/employer-subscriptions.service");
let EmployerCompaniesController = class EmployerCompaniesController {
    constructor(employerCompaniesService, employerAdminsService, employerInvitationsService, employerAdminInvitationsService, notificationsService, employerSubscriptionsService) {
        this.employerCompaniesService = employerCompaniesService;
        this.employerAdminsService = employerAdminsService;
        this.employerInvitationsService = employerInvitationsService;
        this.employerAdminInvitationsService = employerAdminInvitationsService;
        this.notificationsService = notificationsService;
        this.employerSubscriptionsService = employerSubscriptionsService;
    }
    async create(signUpEmployerDto, files) {
        const token = await this.employerCompaniesService.verifyToken(encodeURIComponent(signUpEmployerDto.token), true);
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        signUpEmployerDto._id = token.employer._id;
        if (files && files.employerLogo) {
            await sharp(files.employerLogo[0].path)
                .resize({ height: 200, width: 200 })
                .toFile(files.employerLogo[0].path.replace('.', '_t.'));
            signUpEmployerDto.employerLogoThumbnail = (config_1.EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.EMPLOYER_COMPANIES_IMG_PATH, files);
                files.employerLogo[0].buffer = fs.readFileSync(files.employerLogo[0].path);
                files.employerLogoThumbnail = [
                    Object.assign(Object.assign({}, files.employerLogo[0]), { buffer: await sharp(files.employerLogo[0].path)
                            .resize({ height: 200, width: 200 })
                            .toBuffer(), filename: files.employerLogo[0].filename.replace('.', '_t.') }),
                ];
                if (files && files.employerBanner) {
                    files.employerBanner[0].buffer = fs.readFileSync(files.employerBanner[0].path);
                }
                s3_1.moveFilesToS3(config_1.EMPLOYER_COMPANIES_IMG_PATH, files);
            }
        }
        signUpEmployerDto.employerLogo = files && files.employerLogo ? '/' + config_1.EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename : '';
        signUpEmployerDto.employerBanner =
            files && files.employerBanner ? '/' + config_1.EMPLOYER_COMPANIES_IMG_PATH + files.employerBanner[0].filename : '';
        signUpEmployerDto.invitation = 'accepted';
        const employerCompany = await this.employerCompaniesService.updateEmployer(signUpEmployerDto);
        const invitation = await this.employerInvitationsService.updateAcceptedInvitation(employerCompany.data._id);
        signUpEmployerDto.employerId = employerCompany.data._id;
        signUpEmployerDto.role = 'superadmin';
        if (files && files.profilePhoto) {
            await sharp(files.profilePhoto[0].path)
                .resize({ height: 200, width: 200 })
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            signUpEmployerDto.profilePhotoThumbnail = (config_1.EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.EMPLOYER_ADMINS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize({ height: 200, width: 200 })
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.EMPLOYER_ADMINS_IMG_PATH, files);
            }
        }
        signUpEmployerDto.profilePhoto = files && files.profilePhoto ? config_1.EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename : '';
        const user = await this.employerAdminsService.updateEmployerAdmin({
            emailAddress: invitation.emailAddress,
            fullname: signUpEmployerDto.fullname,
            password: signUpEmployerDto.password,
            profilePhoto: signUpEmployerDto.profilePhoto,
            profilePhotoThumbnail: signUpEmployerDto.profilePhotoThumbnail,
            designation: signUpEmployerDto.designation,
            invitation: 'accepted',
            joinDate: new Date(),
        });
        await this.employerAdminInvitationsService.acceptInvitation(invitation.emailAddress);
        const { fullname, emailAddress, role, employerCompanyId, designation } = user;
        const userResponse = { fullname, emailAddress, role, employerCompanyId, designation };
        const employerCompanyResponse = employerCompany.data;
        this.notificationsService.employerJoined(employerCompanyResponse, invitation.invitedBy);
        return ResponseHandler_1.default.success({
            user: userResponse,
            employer: employerCompanyResponse,
        });
    }
    async updateEmployer(updateEmployerCompanyDto, files, user) {
        if (user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized');
        }
        updateEmployerCompanyDto.employerLogoThumbnail = updateEmployerCompanyDto.employerLogoPath
            ? updateEmployerCompanyDto.employerLogoPath.replace('.', '_t.')
            : null;
        if (files && files.employerLogo) {
            await sharp(files.employerLogo[0].path)
                .resize({ height: 200, width: 200 })
                .toFile(files.employerLogo[0].path.replace('.', '_t.'));
            updateEmployerCompanyDto.employerLogoThumbnail = ('/' + config_1.EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.EMPLOYER_COMPANIES_IMG_PATH, files);
                files.employerLogo[0].buffer = fs.readFileSync(files.employerLogo[0].path);
                files.employerLogoThumbnail = [
                    Object.assign(Object.assign({}, files.employerLogo[0]), { buffer: await sharp(files.employerLogo[0].path)
                            .resize({ height: 200, width: 200 })
                            .toBuffer(), filename: files.employerLogo[0].filename.replace('.', '_t.') }),
                ];
                if (files && files.employerBanner) {
                    files.employerBanner[0].buffer = fs.readFileSync(files.employerBanner[0].path);
                }
                s3_1.moveFilesToS3(config_1.EMPLOYER_COMPANIES_IMG_PATH, files);
            }
        }
        updateEmployerCompanyDto._id = user.employerId ? user.employerId : updateEmployerCompanyDto._id;
        if (!updateEmployerCompanyDto._id) {
            return ResponseHandler_1.default.fail('Employer id is required');
        }
        updateEmployerCompanyDto.employerLogo =
            files && files.employerLogo ? '/' + config_1.EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename : '';
        updateEmployerCompanyDto.employerBanner =
            files && files.employerBanner ? config_1.EMPLOYER_COMPANIES_IMG_PATH + files.employerBanner[0].filename : '';
        const { data: employer } = await this.employerCompaniesService.updateEmployer(updateEmployerCompanyDto);
        return ResponseHandler_1.default.success(employer);
    }
    async SuspendUnsuspendCollege(employerCompanyIdDto, user) {
        if (user.collegeId || user.employerId) {
            return ResponseHandler_1.default.fail('Only Unmudl can access this route.');
        }
        return await this.employerCompaniesService.toggleSuspendEmployer(employerCompanyIdDto.employerId);
    }
    async GetEmployerByToken(tokenDto) {
        const token = await this.employerCompaniesService.verifyToken(encodeURIComponent(tokenDto.token));
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        return ResponseHandler_1.default.success({
            employer: token.employer,
            admin: token.admin,
        });
    }
    async getEmployerProfile(employerCompanyIdDto, user) {
        const employerId = user.employerId ? user.employerId : employerCompanyIdDto.employerId;
        if (employerId) {
            return await this.employerCompaniesService.getEmployerById(employerId);
        }
        else {
            return ResponseHandler_1.default.fail('Employer id is required.');
        }
    }
    async GetEmployers(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
        return await this.employerCompaniesService.getEmployers(listDto);
    }
    async GetEmployersAsCsv(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
        const response = await this.employerCompaniesService.getEmployersAsCsv(listDto);
        const fields = ['Employer Name', 'Location', 'NAICS Code', 'Employees Size', 'Date of joining'];
        return json2csv.parse(response.data, { fields });
    }
    async GetEmployerDashboard(adminHomeDto, user) {
        adminHomeDto.perPage = Number(adminHomeDto.perPage) ? Number(adminHomeDto.perPage) : 10;
        adminHomeDto.interval = Number(adminHomeDto.interval);
        const [{ data: totalEmployers }, { data: newEmployers }, growth, employers] = await Promise.all([
            this.employerCompaniesService.getEmployersCount({}),
            this.employerCompaniesService.getEmployersCount({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
            this.employerCompaniesService.getEmployerGrowth({
                start: adminHomeDto.graphStart,
                end: adminHomeDto.graphEnd,
                interval: adminHomeDto.interval,
            }),
            this.employerCompaniesService.getEmployers({
                keyword: '',
                page: 1,
                perPage: adminHomeDto.perPage,
                sortBy: 'partner',
                sortOrder: '1',
            }),
        ]);
        return ResponseHandler_1.default.success({
            stats: { totalEmployers, newEmployers },
            growth: growth.data,
            employers: { employers: employers.data.employers, rows: employers.data.rows },
        });
    }
    async GetEmployersStatistics(statsDto) {
        const [{ data: totalEmployers }, { data: newEmployers }] = await Promise.all([
            this.employerCompaniesService.getEmployersCount({}),
            this.employerCompaniesService.getEmployersCount(statsDto),
        ]);
        const stats = {
            newEmployers,
            totalEmployers,
        };
        return ResponseHandler_1.default.success(stats);
    }
    async GetEmployerGrowthGraph(analyticsCountDto, user) {
        analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;
        return await this.employerCompaniesService.getEmployerGrowth(analyticsCountDto);
    }
    async GetEmployerGrowthGraphAsCsv(analyticsCountDto, user) {
        analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;
        const response = await this.employerCompaniesService.getEmployerGrowth(analyticsCountDto, true);
        const fields = ['Joined On', 'New Users Registered'];
        return json2csv.parse(response.data, { fields });
    }
    async UnmudlAdminEmployerPortalAccess(employerCompanyIdDto, user) {
        if (user.type !== 'user' || user.collegeId) {
            return ResponseHandler_1.default.fail('Only Unmudl superadmin can access this route.');
        }
        return await this.employerCompaniesService.returnUnmudlAdminEmployerPortalAccess(employerCompanyIdDto.employerId, user);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Employer Signup: All data from the steps of sign-up will be sent to create a new employer account.' }),
    common_1.Post('signup'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'employerLogo', maxCount: 1 },
        { name: 'employerBanner', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'profilePhoto') {
                    fs.mkdir('./public' + config_1.EMPLOYER_ADMINS_IMG_PATH, { recursive: true }, err => {
                        if (err) {
                            return ResponseHandler_1.default.fail(err.message);
                        }
                        cb(null, './public' + config_1.EMPLOYER_ADMINS_IMG_PATH);
                    });
                }
                else if (file.fieldname === 'employerLogo') {
                    fs.mkdir('./public' + config_1.EMPLOYER_COMPANIES_IMG_PATH, { recursive: true }, err => {
                        if (err) {
                            return ResponseHandler_1.default.fail(err.message);
                        }
                        cb(null, './public' + config_1.EMPLOYER_COMPANIES_IMG_PATH);
                    });
                }
                else if (file.fieldname === 'employerBanner') {
                    fs.mkdir('./public' + config_1.EMPLOYER_COMPANIES_BANNER_PATH, { recursive: true }, err => {
                        if (err) {
                            return ResponseHandler_1.default.fail(err.message);
                        }
                        cb(null, './public' + config_1.EMPLOYER_COMPANIES_BANNER_PATH);
                    });
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_up_employer_dto_1.SignUpEmployerDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "create", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Update employer details.' }),
    common_1.Post('update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'employerLogo', maxCount: 1 },
        { name: 'employerBanner', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'employerLogo') {
                    fs.mkdir('./public' + config_1.EMPLOYER_COMPANIES_IMG_PATH, { recursive: true }, err => {
                        if (err) {
                            return ResponseHandler_1.default.fail(err.message);
                        }
                        cb(null, './public' + config_1.EMPLOYER_COMPANIES_IMG_PATH);
                    });
                }
                else if (file.fieldname === 'employerBanner') {
                    fs.mkdir('./public' + config_1.EMPLOYER_COMPANIES_BANNER_PATH, { recursive: true }, err => {
                        if (err) {
                            return ResponseHandler_1.default.fail(err.message);
                        }
                        cb(null, './public' + config_1.EMPLOYER_COMPANIES_BANNER_PATH);
                    });
                }
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, common_1.UploadedFiles()),
    __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_employer_company_dto_1.UpdateEmployerCompanyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "updateEmployer", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Toggle suspend employer account.' }),
    common_1.Post('/toggle-suspend'),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerCompanyId_dto_1.EmployerCompanyIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "SuspendUnsuspendCollege", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Verify token and return employer.' }),
    common_1.Get('by-token'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_dto_1.TokenDto]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployerByToken", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Get college profile.' }),
    common_1.Get('profile'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerCompanyId_dto_1.EmployerCompanyIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "getEmployerProfile", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of registered colleges.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployers", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get colleges as csv.' }),
    common_1.Get('/csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=partners.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployersAsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get employer dashboard data.' }),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adminHomeDto_dto_1.default, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployerDashboard", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get partner statistics.' }),
    common_1.Get('statistics'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stats_dto_1.default]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployersStatistics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get colleges growth graph.' }),
    common_1.Get('/graph'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyticsCount_dto_1.AnalyticsCountDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployerGrowthGraph", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get colleges growth graph.' }),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=growth.csv'),
    common_1.Get('/graph/csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyticsCount_dto_1.AnalyticsCountDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "GetEmployerGrowthGraphAsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('superadmin'),
    swagger_1.ApiOperation({ summary: 'Get unmudl admin access to employer portal.' }),
    common_1.Post('/unmudl-admin/access'),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerCompanyId_dto_1.EmployerCompanyIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerCompaniesController.prototype, "UnmudlAdminEmployerPortalAccess", null);
EmployerCompaniesController = __decorate([
    swagger_1.ApiTags('Employers Portal - Employers'),
    common_1.Controller('employer-companies'),
    __metadata("design:paramtypes", [employer_companies_service_1.EmployerCompaniesService,
        employer_admins_service_1.EmployerAdminsService,
        employer_invitations_service_1.EmployerInvitationsService,
        employer_admin_invitations_service_1.EmployerAdminInvitationsService,
        notifications_service_1.NotificationsService,
        employer_subscriptions_service_1.EmployerSubscriptionsService])
], EmployerCompaniesController);
exports.EmployerCompaniesController = EmployerCompaniesController;
//# sourceMappingURL=employer-companies.controller.js.map