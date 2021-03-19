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
const employer_admins_service_1 = require("./employer-admins.service");
const swagger_1 = require("@nestjs/swagger");
const email_dto_1 = require("../common/dto/email.dto");
const resetPassword_dto_1 = require("../users/dto/resetPassword.dto");
const token_dto_1 = require("../users/dto/token.dto");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const update_admin_dto_1 = require("./dto/update-admin.dto");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("../config/config");
const multer_1 = require("multer");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const list_dto_1 = require("../common/dto/list.dto");
const update_password_dto_1 = require("./dto/update-password.dto");
const createUser_dto_1 = require("../users/dto/createUser.dto");
const employer_admin_invitations_service_1 = require("../employer-admin-invitations/employer-admin-invitations.service");
const fs = require("fs");
const functions_1 = require("../common/functions");
const responseMessages_1 = require("../config/responseMessages");
const ResponseHandler_1 = require("../common/ResponseHandler");
const sharp = require("sharp");
const employerAdminId_dto_1 = require("../common/dto/employerAdminId.dto");
const validators_1 = require("../common/validators");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const updateEmployerAdminPreferences_dto_1 = require("./dto/updateEmployerAdminPreferences.dto");
const update_employer_admin_role_dto_1 = require("./dto/update-employer-admin-role.dto");
const s3_1 = require("../s3upload/s3");
const stripeToken_dto_1 = require("../common/dto/stripeToken.dto");
const stripe_service_1 = require("../stripe/stripe.service");
const employer_subscriptions_service_1 = require("../employer-subscriptions/employer-subscriptions.service");
let EmployerAdminsController = class EmployerAdminsController {
    constructor(employerAdminsService, employerAdminInvitationsService, notificationsService, stripeService, employerSubscriptionsService) {
        this.employerAdminsService = employerAdminsService;
        this.employerAdminInvitationsService = employerAdminInvitationsService;
        this.notificationsService = notificationsService;
        this.stripeService = stripeService;
        this.employerSubscriptionsService = employerSubscriptionsService;
    }
    async getAdminsList(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? listDto.page : 1;
        listDto.perPage = listDto.perPage ? listDto.perPage : 10;
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
        return await this.employerAdminsService.getAdminsList(listDto);
    }
    async getAdminNamesList(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
        return await this.employerAdminsService.getAdminNamesList(listDto);
    }
    async getAdminsListCsv(listDto, user) {
        listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        return await this.employerAdminsService.getAdminsListCsv(listDto);
    }
    async addOtherAdmin(createUserDto, user, files) {
        const token = await this.employerAdminsService.verifyToken({
            token: encodeURIComponent(createUserDto.token),
            password: '',
        }, true);
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        createUserDto.password = await functions_1.default.getHash(createUserDto.password);
        createUserDto.invitation = 'accepted';
        createUserDto.profilePhoto = files && files.profilePhoto ? config_1.EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename : '';
        if (files && files.profilePhoto) {
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            createUserDto.profilePhotoThumbnail = (config_1.EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.EMPLOYER_ADMINS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.EMPLOYER_ADMINS_IMG_PATH, files);
            }
        }
        const dt = new Date();
        createUserDto.joinDate = dt.toISOString();
        const userResponse = await this.employerAdminsService.updateDetails(createUserDto, token.adminId);
        await this.employerAdminInvitationsService.acceptInvitation(userResponse.data.emailAddress);
        this.notificationsService.employerAdminJoined(userResponse.data);
        return ResponseHandler_1.default.success(userResponse.data, responseMessages_1.default.success.registerdUser);
    }
    async updateEmployerAdmin(updateAdminDto, user, files) {
        updateAdminDto.profilePhoto = updateAdminDto.profilePhotoPath;
        updateAdminDto.profilePhotoThumbnail = updateAdminDto.profilePhotoPath ? updateAdminDto.profilePhotoPath.replace('.', '_t.') : null;
        if (files && files.profilePhoto && files.profilePhoto[0]) {
            updateAdminDto.profilePhoto = config_1.EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename;
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            updateAdminDto.profilePhotoThumbnail = (config_1.EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.EMPLOYER_ADMINS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.EMPLOYER_ADMINS_IMG_PATH, files);
            }
        }
        const adminId = updateAdminDto.adminId ? updateAdminDto.adminId : user._id;
        delete updateAdminDto.adminId;
        return await this.employerAdminsService.updateEmployerAdminById(updateAdminDto, adminId);
    }
    async addCard(stripeTokenDto, user) {
        return await this.stripeService.addCardToEmployer(user, stripeTokenDto.stripeToken);
    }
    async getEmployerAdminProfile(user) {
        return await this.employerAdminsService.getAdminById(user._id);
    }
    async getEmployerAdminProfileData(user) {
        const { data } = await this.employerAdminsService.getAdminData(user._id);
        const { data: activeSubscription } = await this.employerSubscriptionsService.getActiveSubscription(user.employerId);
        const newUser = Object.assign({}, Object.assign(Object.assign({}, data.user), { activeSubscription }));
        console.log(newUser);
        return ResponseHandler_1.default.success({ user: newUser });
    }
    async getEmployerAdminDetails(employerAdminIdDto, user) {
        return await this.employerAdminsService.getAdminById(employerAdminIdDto.adminId);
    }
    async sendPasswordResetLink(emailDto) {
        const admin = await this.employerAdminsService.getAdminByEmail(emailDto.emailAddress);
        if (admin && admin.invitation !== 'pending') {
            const linkSent = await this.employerAdminsService.sendResetPasswordLink(admin);
            if (linkSent) {
                return ResponseHandler_1.default.success({
                    message: 'Password reset link sent to your email address',
                });
            }
            else {
                return ResponseHandler_1.default.fail('Unable to send email');
            }
        }
        else {
            return ResponseHandler_1.default.fail('Email not found');
        }
    }
    async UpdateEmployerAdminPassword(updatePasswordDto, user) {
        return await this.employerAdminsService.changePassword(updatePasswordDto, user._id);
    }
    async resetPassword(resetPasswordDto) {
        const token = await this.employerAdminsService.verifyToken(resetPasswordDto);
        if (token) {
            const updatePassword = await this.employerAdminsService.updatePassword(resetPasswordDto.password, token.adminId);
            if (updatePassword) {
                return ResponseHandler_1.default.success({}, 'Password has been updated successfully');
            }
            else {
                return ResponseHandler_1.default.fail('User not found');
            }
        }
        else {
            return ResponseHandler_1.default.fail('Token is invalid or expired');
        }
    }
    async UpdateUserRole(employerAdminIdDto, updateEmployerAdminRole, user) {
        updateEmployerAdminRole.adminId = employerAdminIdDto.adminId;
        return await this.employerAdminsService.updateRole(updateEmployerAdminRole, user);
    }
    async RemoveAdmin(employerAdminIdDto, user) {
        const adminToDelete = await this.employerAdminsService.getAdminById(employerAdminIdDto.adminId, false);
        if ((user.employerId && !adminToDelete.employerId) || adminToDelete.employerId.toString() !== user.employerId.toString()) {
            return ResponseHandler_1.default.fail('You cannot delete this admin.');
        }
        if (user.role !== 'superadmin' && adminToDelete.role === 'superadmin') {
            return ResponseHandler_1.default.fail('You cannot delete user of higher role.');
        }
        await this.employerAdminsService.removeUser(employerAdminIdDto.adminId);
        return ResponseHandler_1.default.success({}, 'You successfully deleted the user.');
    }
    async SuspendUser(employerAdminIdDto, user) {
        const adminToSuspend = await this.employerAdminsService.getAdminById(employerAdminIdDto.adminId, false);
        const authorized = validators_1.isAuthorized(adminToSuspend, user);
        if (!authorized.isAuthorized) {
            return ResponseHandler_1.default.fail(authorized.msg);
        }
        else {
            adminToSuspend.isSuspended = !adminToSuspend.isSuspended;
            const res = await adminToSuspend.save();
            return ResponseHandler_1.default.success({ user: res });
        }
    }
    async GetAdminByToken(tokenDto) {
        const token = await this.employerAdminsService.verifyToken({
            token: encodeURIComponent(tokenDto.token),
            password: '',
        });
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        const admin = await this.employerAdminsService.getAdminById(token.adminId);
        return admin ? ResponseHandler_1.default.success(admin) : ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
    }
    async GetNotifications(paginationDto, user) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 4;
        return await this.employerAdminsService.getEmployerAdminNotifications(paginationDto, user);
    }
    async UpdateUserPreferences(updateEmployerAdminPreferencesDto, user) {
        return await this.employerAdminsService.updatePreferences(updateEmployerAdminPreferencesDto, user._id);
    }
    async initializeContactUnmudlChatsForAllEmployerAdmins(user) {
        if (user.employerId || user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        return await this.employerAdminsService.initializeContactUnmudlChatsForAllEmployerAdmins();
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Get employer admins list.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "getAdminsList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Get employer admins list.' }),
    common_1.Get('names'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "getAdminNamesList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get employer admin list as csv.' }),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=Employer Admins.csv'),
    common_1.Get('csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "getAdminsListCsv", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Add other admins to employer portal.' }),
    common_1.Post('/create/other'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.EMPLOYER_ADMINS_IMG_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.EMPLOYER_ADMINS_IMG_PATH);
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createUser_dto_1.CreateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "addOtherAdmin", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update employer admin.' }),
    common_1.Post('update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.EMPLOYER_ADMINS_IMG_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.EMPLOYER_ADMINS_IMG_PATH);
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_admin_dto_1.UpdateAdminDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "updateEmployerAdmin", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Add new user card to stripe' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Post('add-card'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stripeToken_dto_1.StripeTokenDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "addCard", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get profile of logged in employer admin.' }),
    common_1.Get('profile'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "getEmployerAdminProfile", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get profile of logged in employer admin.' }),
    common_1.Get('data'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "getEmployerAdminProfileData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get profile details of an employer admin.' }),
    common_1.Get('/details/:adminId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAdminId_dto_1.EmployerAdminIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "getEmployerAdminDetails", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get password reset link.' }),
    common_1.Post('forgot-password'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_dto_1.EmailDto]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "sendPasswordResetLink", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user password.' }),
    common_1.Post('update-password'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_password_dto_1.UpdatePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "UpdateEmployerAdminPassword", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Reset user password.' }),
    common_1.Post('reset-password'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetPassword_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "resetPassword", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Update employer admin role.' }),
    common_1.Post('/role/:adminId'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __param(1, common_1.Body()),
    __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAdminId_dto_1.EmployerAdminIdDto,
        update_employer_admin_role_dto_1.UpdateEmployerAdminRoleDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "UpdateUserRole", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Delete user.' }),
    common_1.Delete(':adminId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAdminId_dto_1.EmployerAdminIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "RemoveAdmin", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Suspend user.' }),
    common_1.Post('suspend'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAdminId_dto_1.EmployerAdminIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "SuspendUser", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Verify token and return employer admin.' }),
    common_1.Get('by-token'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_dto_1.TokenDto]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "GetAdminByToken", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get users notifications.' }),
    common_1.Get('notifications'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "GetNotifications", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user notification preferences.' }),
    common_1.Post('updatePreferences'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateEmployerAdminPreferences_dto_1.UpdateEmployerAdminPreferencesDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "UpdateUserPreferences", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Initialize contact unmudl chats for a user.' }),
    common_1.Post('init-contact-unmudl-for-all'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles(),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerAdminsController.prototype, "initializeContactUnmudlChatsForAllEmployerAdmins", null);
EmployerAdminsController = __decorate([
    swagger_1.ApiTags('Employers Portal - Admins'),
    common_1.Controller('employer-admins'),
    __metadata("design:paramtypes", [employer_admins_service_1.EmployerAdminsService,
        employer_admin_invitations_service_1.EmployerAdminInvitationsService,
        notifications_service_1.NotificationsService,
        stripe_service_1.StripeService,
        employer_subscriptions_service_1.EmployerSubscriptionsService])
], EmployerAdminsController);
exports.EmployerAdminsController = EmployerAdminsController;
//# sourceMappingURL=employer-admins.controller.js.map