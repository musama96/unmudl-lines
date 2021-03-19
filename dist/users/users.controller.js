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
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./users.service");
const userTokens_service_1 = require("./userTokens.service");
const createUser_dto_1 = require("./dto/createUser.dto");
const token_dto_1 = require("./dto/token.dto");
const userId_dto_1 = require("../common/dto/userId.dto");
const resetPassword_dto_1 = require("./dto/resetPassword.dto");
const instructorCoursesList_dto_1 = require("./dto/instructorCoursesList.dto");
const email_dto_1 = require("../common/dto/email.dto");
const updateUserRole_dto_1 = require("../common/dto/updateUserRole.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const list_dto_1 = require("../common/dto/list.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const updateBasicDetails_dto_1 = require("./dto/updateBasicDetails.dto");
const updatePreferences_dto_1 = require("./dto/updatePreferences.dto");
const updatePassword_dto_1 = require("./dto/updatePassword.dto");
const updateUser_dto_1 = require("./dto/updateUser.dto");
const stripe_service_1 = require("../stripe/stripe.service");
const invitations_service_1 = require("../invitations/invitations.service");
const activities_service_1 = require("../activities/activities.service");
const access_validator_1 = require("../common/validators/access.validator");
const config_1 = require("../config/config");
const optionalDurationPagination_dto_1 = require("../common/dto/optionalDurationPagination.dto");
const optionalDuration_dto_1 = require("../common/dto/optionalDuration.dto");
const stripeToken_dto_1 = require("../common/dto/stripeToken.dto");
const colleges_service_1 = require("../colleges/colleges.service");
const payouts_service_1 = require("../payouts/payouts.service");
const transactions_service_1 = require("../transactions/transactions.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const functions_1 = require("../common/functions");
const instructorSectionData_dto_1 = require("./dto/instructorSectionData.dto");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const invitationId_dto_1 = require("../common/dto/invitationId.dto");
const updateOther_dto_1 = require("./dto/updateOther.dto");
const sort_enum_1 = require("../common/enums/sort.enum");
const duration_dto_1 = require("../common/dto/duration.dto");
const recentActivity_dto_1 = require("./dto/recentActivity.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const activity_model_1 = require("../activities/activity.model");
const userActivityCategory_model_1 = require("../activities/userActivityCategory.model");
const notifications_service_1 = require("../notifications/notifications.service");
const moment = require("moment");
const mongoose = require("mongoose");
const s3_1 = require("../s3upload/s3");
const sharp = require('sharp');
const fs = require("fs");
let UsersController = class UsersController {
    constructor(usersService, collegesService, stripeService, userTokensService, invitationsService, activitiesService, payoutsService, transactionsService, notificationsService) {
        this.usersService = usersService;
        this.collegesService = collegesService;
        this.stripeService = stripeService;
        this.userTokensService = userTokensService;
        this.invitationsService = invitationsService;
        this.activitiesService = activitiesService;
        this.payoutsService = payoutsService;
        this.transactionsService = transactionsService;
        this.notificationsService = notificationsService;
    }
    async GetAllUsers(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        return await this.usersService.getUsers(listDto);
    }
    async GetAllUsersList(keywordDto, user) {
        keywordDto.collegeId = user.collegeId ? user.collegeId : keywordDto.collegeId;
        return await this.usersService.getUsersList(keywordDto, user.emailAddress);
    }
    async GetUserByToken(tokenDto) {
        const token = await this.userTokensService.verifyToken({ token: encodeURIComponent(tokenDto.token), password: '' });
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        const user = await this.usersService.getUserById(token.userId);
        return user ? ResponseHandler_1.default.success(user) : ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
    }
    async GetProfileData(user) {
        const [userData, recentActivities] = await Promise.all([
            this.usersService.getUserById(user._id),
            this.activitiesService.getActivities({
                type: 'user',
                userId: user._id,
                start: new Date(moment()
                    .subtract(1, 'd')
                    .toISOString()),
                end: new Date(),
                page: 1,
                perPage: Infinity,
            }),
        ]);
        return ResponseHandler_1.default.success({
            user: userData,
            recentActivities: recentActivities.data,
        });
    }
    async GetUserRecentActivities(durationDto, user) {
        return await this.activitiesService.getActivities({
            type: 'user',
            userId: user._id,
            start: durationDto.start,
            end: durationDto.end,
            page: 1,
            perPage: Infinity,
        });
    }
    async GetUserDetails(userIdDto) {
        const user = await this.usersService.getUserById(userIdDto.userId);
        return ResponseHandler_1.default.success(user);
    }
    async UpdateUserDetails(updateUserDto, user, files) {
        if (user.emailAddress !== updateUserDto.emailAddress) {
            const oldUser = await this.usersService.getUserByEmail(updateUserDto.emailAddress);
            if (oldUser) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.emailRegistered);
            }
        }
        if (files && files.profilePhoto && files.profilePhoto[0]) {
            updateUserDto.profilePhoto = config_1.USERS_IMG_PATH + files.profilePhoto[0].filename;
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            updateUserDto.profilePhotoThumbnail = (config_1.USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.USERS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.USERS_IMG_PATH, files);
            }
        }
        updateUserDto.bio = updateUserDto.bio ? updateUserDto.bio : null;
        return await this.usersService.updateDetails(updateUserDto, user._id);
    }
    async UpdateOtherUserDetails(updateOtherDto, files) {
        updateOtherDto.bio = updateOtherDto.bio ? updateOtherDto.bio : null;
        updateOtherDto.profilePhoto = updateOtherDto.profilePhotoPath;
        updateOtherDto.profilePhotoThumbnail = updateOtherDto.profilePhotoPath ? updateOtherDto.profilePhotoPath.replace('.', '_t.') : null;
        if (files && files.profilePhoto && files.profilePhoto[0]) {
            updateOtherDto.profilePhoto = config_1.USERS_IMG_PATH + files.profilePhoto[0].filename;
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            updateOtherDto.profilePhotoThumbnail = (config_1.USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.USERS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.USERS_IMG_PATH, files);
            }
        }
        const userData = await this.usersService.updateDetails(updateOtherDto, updateOtherDto.userId);
        return ResponseHandler_1.default.success(userData.data, responseMessages_1.default.success.updateUser);
    }
    async UpdateUserBasicDetails(updateBasicDetailsDto, user, files) {
        if (user.emailAddress !== updateBasicDetailsDto.emailAddress) {
            const oldUser = await this.usersService.getUserByEmail(updateBasicDetailsDto.emailAddress);
            if (oldUser) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.emailRegistered);
            }
        }
        updateBasicDetailsDto.bio = updateBasicDetailsDto.bio ? updateBasicDetailsDto.bio : null;
        updateBasicDetailsDto.profilePhoto = updateBasicDetailsDto.profilePhotoPath;
        updateBasicDetailsDto.profilePhotoThumbnail = updateBasicDetailsDto.profilePhotoPath
            ? updateBasicDetailsDto.profilePhotoPath.replace('.', '_t.')
            : null;
        if (files && files.profilePhoto && files.profilePhoto[0]) {
            updateBasicDetailsDto.profilePhoto = config_1.USERS_IMG_PATH + files.profilePhoto[0].filename;
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            updateBasicDetailsDto.profilePhotoThumbnail = (config_1.USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.USERS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.USERS_IMG_PATH, files);
            }
        }
        return await this.usersService.updateBasicDetails(updateBasicDetailsDto, user._id);
    }
    async UpdateUserPreferences(updatePreferencesDto, user) {
        return await this.usersService.updatePreferences(updatePreferencesDto, user._id);
    }
    async UpdateUserPassword(updatePasswordDto, user) {
        return await this.usersService.changePassword(updatePasswordDto, user._id);
    }
    async GetInstructors(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getInstructors(listDto);
    }
    async GetInstructorNames(keywordDto, user) {
        keywordDto.collegeId = user.collegeId ? user.collegeId : keywordDto.collegeId;
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        if (!user.collegeId && !keywordDto.collegeId) {
            return ResponseHandler_1.default.fail('College id is required.');
        }
        return await this.usersService.getInstructorNames(keywordDto);
    }
    async GetUsersNames(keywordDto, user) {
        keywordDto.collegeId = user.collegeId ? user.collegeId : keywordDto.collegeId ? keywordDto.collegeId : null;
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        return await this.usersService.getUsersNames(keywordDto);
    }
    async GetInvitedInstructors(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getInvitedInstructors(listDto);
    }
    async GetCompleteInstructorsSectionData(instructorSectionDataDto, user) {
        instructorSectionDataDto.collegeId = user.collegeId ? user.collegeId : instructorSectionDataDto.collegeId;
        instructorSectionDataDto.keyword = instructorSectionDataDto.keyword ? instructorSectionDataDto.keyword : '';
        instructorSectionDataDto.page = instructorSectionDataDto.page ? Number(instructorSectionDataDto.page) : 1;
        instructorSectionDataDto.perPage = instructorSectionDataDto.perPage ? Number(instructorSectionDataDto.perPage) : 10;
        instructorSectionDataDto.sortOrder = instructorSectionDataDto.sortOrder === 'asc' ? '1' : '-1';
        const instructorResponse = await this.usersService.getInstructors(instructorSectionDataDto);
        return ResponseHandler_1.default.success({
            instructors: instructorResponse.data,
        });
    }
    async GetInstructorsCsv(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getInstructorsCsv(listDto);
    }
    async GetInvitedInstructorsCsv(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getInvitedInstructorsCsv(listDto);
    }
    async GetAdmins(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getAdmins(listDto);
    }
    async GetAdminsCsv(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getAdminsCsv(listDto);
    }
    async getAdminDetails(userIdDto) {
        return await this.usersService.getInstructorDetails(userIdDto);
    }
    async getAdminProfileSectionDetails(userIdDto) {
        const [admin, recentActivity] = await Promise.all([
            this.usersService.getInstructorDetails(userIdDto),
            this.activitiesService.getActivities({
                type: 'user',
                userId: userIdDto.userId,
                start: new Date(moment()
                    .subtract(1, 'd')
                    .toISOString()),
                end: new Date(),
                page: 1,
                perPage: Infinity,
            }),
        ]);
        return ResponseHandler_1.default.success({
            admin: admin.data.instructorDetails,
            recentActivity: recentActivity.data,
        });
    }
    async getAdminRecentActivity(recentActivityDto) {
        const recentActivity = await this.activitiesService.getActivities({
            type: 'user',
            userId: recentActivityDto.userId,
            start: new Date(recentActivityDto.start),
            end: new Date(recentActivityDto.end),
            page: 1,
            perPage: Infinity,
        });
        return ResponseHandler_1.default.success(recentActivity.data);
    }
    async GetInvitedAdmins(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getInvitedAdmins(listDto);
    }
    async UpdateUserRole(userIdDto, role, user) {
        return await this.usersService.updateRole({ userId: userIdDto.userId, role }, user);
    }
    async GetCompleteAdminSectionData(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        const adminsResponse = await this.usersService.getAdmins(listDto);
        return ResponseHandler_1.default.success({
            admins: adminsResponse.data,
        });
    }
    async GetInvitedAdminsCsv(listDto, user) {
        listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        return await this.usersService.getInvitedAdminsCsv(listDto);
    }
    async addOtherUser(createUserDto, user, files) {
        const token = await this.userTokensService.verifyToken({ token: encodeURIComponent(createUserDto.token), password: '' }, true);
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        createUserDto.userId = token.userId;
        createUserDto.password = await functions_1.default.getHash(createUserDto.password);
        createUserDto.invitation = 'accepted';
        createUserDto.profilePhoto = files && files.profilePhoto ? config_1.USERS_IMG_PATH + files.profilePhoto[0].filename : '';
        if (files && files.profilePhoto) {
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            createUserDto.profilePhotoThumbnail = (config_1.USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.USERS_IMG_PATH, files);
                files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.profilePhoto[0]), { buffer: await sharp(files.profilePhoto[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.profilePhoto[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.USERS_IMG_PATH, files);
            }
        }
        const userResponse = await this.usersService.updateDetails(createUserDto, createUserDto.userId);
        await this.invitationsService.acceptInvitation(userResponse.data.emailAddress);
        const activities = [
            {
                type: activity_model_1.ActivityTypes.User,
                user: mongoose.Types.ObjectId(userResponse.data._id),
                userRole: userResponse.data.role,
                userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(userActivityCategory_model_1.UserActivities.UserJoined)),
            },
        ];
        await this.activitiesService.createActivities(activities);
        this.notificationsService.userJoined(userResponse.data);
        return ResponseHandler_1.default.success(userResponse.data, responseMessages_1.default.success.registerdUser);
    }
    async getAdminProfileData(user) {
        return await this.usersService.getAdminData(user._id);
    }
    async sendPasswordResetLink(emailDto) {
        const user = await this.usersService.getUserByEmail(emailDto.emailAddress);
        if (user && user.invitation !== 'pending') {
            const linkSent = await this.usersService.sendResetPasswordLink(user);
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
    async resetPassword(resetPasswordDto) {
        const token = await this.userTokensService.verifyToken(resetPasswordDto);
        if (token) {
            const updatePassword = await this.usersService.updatePassword(resetPasswordDto.password, token.userId);
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
    async checkIfEmailExists(emailDto) {
        return await this.usersService.checkIfEmailExists(emailDto.emailAddress.toLowerCase());
    }
    async addCard(stripeTokenDto, user) {
        return await this.stripeService.addCard(user, stripeTokenDto.stripeToken);
    }
    async getCards(user) {
        return await this.stripeService.getCards(user);
    }
    async connectStripeAccount(authToken, user) {
        return await this.stripeService.connectStripeAccount(user, authToken);
    }
    async createPayoutForCollege(amount, user) {
        const college = await this.collegesService.getCollegeById(user.collegeId);
        if (college.data.stripeId) {
            const response = await this.stripeService.createPayoutOnConnectAccount(college.data.stripeId, amount * 100);
            await this.payoutsService.addPayout({
                userId: user._id,
                amount,
                collegeId: user.collegeId,
            });
            return ResponseHandler_1.default.success(response.data);
        }
        else {
            return ResponseHandler_1.default.fail('You must connect a stripe account first.');
        }
    }
    async getStripeAccountBalance() {
        return await this.stripeService.getConnectAccountBalance('acct_1G5tEhB97ucpAyyn');
    }
    async getInstructorDetails(userIdDto) {
        return await this.usersService.getInstructorDetails(userIdDto);
    }
    async getInstructorProfileSectionDetails(userIdDto) {
        const [instructor, courses, recentActivity] = await Promise.all([
            this.usersService.getInstructorDetails(userIdDto),
            this.usersService.getInstructorCourses({
                userId: userIdDto.userId,
                column: sort_enum_1.InstructorCoursesColumns.courseName,
                order: sort_enum_1.InstructorCoursesOrder.Ascending,
                page: 1,
                perPage: Infinity,
            }),
            this.activitiesService.getActivities({
                type: 'user',
                userId: userIdDto.userId,
                start: new Date(moment()
                    .subtract(1, 'd')
                    .toISOString()),
                end: new Date(),
                page: 1,
                perPage: Infinity,
            }),
        ]);
        return ResponseHandler_1.default.success({
            instructor: instructor.data.instructorDetails,
            courses: courses.data.List,
            recentActivity: recentActivity.data,
        });
    }
    async getInstructorRecentActivity(recentActivityDto) {
        const recentActivity = await this.activitiesService.getActivities({
            type: 'user',
            userId: recentActivityDto.userId,
            start: new Date(recentActivityDto.start),
            end: new Date(recentActivityDto.end),
            page: 1,
            perPage: Infinity,
        });
        return ResponseHandler_1.default.success(recentActivity.data);
    }
    async GetTopInstructors(durationDto) {
        durationDto.page = durationDto.page ? durationDto.page : 1;
        durationDto.perPage = durationDto.perPage ? durationDto.perPage : 10;
        return await this.usersService.getTopInstructors(durationDto);
    }
    async getInstructorCourses(instructorCoursesListDto) {
        instructorCoursesListDto.page = 1;
        instructorCoursesListDto.perPage = Infinity;
        return await this.usersService.getInstructorCourses(instructorCoursesListDto);
    }
    async GetCollegeAccountCounts(durationDto, user) {
        durationDto.collegeId = user.collegeId ? user.collegeId : null;
        const totalAccounts = await this.usersService.getCollegeAccountCounts({ collegeId: durationDto.collegeId });
        const newAccounts = await this.usersService.getCollegeAccountCounts(durationDto);
        return ResponseHandler_1.default.success({
            totalAccounts: totalAccounts.data,
            newAccounts: newAccounts.data,
        });
    }
    async DeleteInvitation(invitationIdDto) {
        const invitationResponse = await this.invitationsService.getInvitationById(invitationIdDto.invitationId);
        const invitation = invitationResponse.data;
        const user = await this.usersService.getUserByEmailMongoObj(invitation.emailAddress);
        if (invitation) {
            if (invitation.status === 'pending') {
                await Promise.all([
                    this.invitationsService.deleteInvitation(invitationIdDto.invitationId),
                    this.usersService.removeUser({ userId: user._id }),
                ]);
                return ResponseHandler_1.default.success({}, 'Invitation deleted successfully.');
            }
            else {
                user.isSuspended = true;
                await Promise.all([user.save(), this.invitationsService.deleteInvitation(invitationIdDto.invitationId)]);
                return ResponseHandler_1.default.success({}, 'Invitation deleted and user suspended successfully.');
            }
        }
        else {
            return ResponseHandler_1.default.fail('Invitation not found.');
        }
    }
    async RemoveUser(userIdDto, user) {
        const userToDelete = await this.usersService.getUserByIdMongoObj(userIdDto.userId);
        if ((user.collegeId && !userToDelete.collegeId) ||
            (userToDelete.collegeId && user.collegeId && userToDelete.collegeId.toString() !== user.collegeId.toString())) {
            return ResponseHandler_1.default.fail('You can only delete users of your own college');
        }
        if (user.role !== 'superadmin' && userToDelete.role === 'superadmin') {
            return ResponseHandler_1.default.fail('Cannot delete user of higher role.');
        }
        await this.usersService.removeUser(userIdDto);
        return ResponseHandler_1.default.success({}, responseMessages_1.default.success.deleteInstructor);
    }
    async SuspendUser(userIdDto, user) {
        const userToSuspend = await this.usersService.getUserByIdMongoObj(userIdDto.userId);
        const authorized = access_validator_1.isAuthorized(userToSuspend, user);
        if (!authorized.isAuthorized) {
            return ResponseHandler_1.default.fail(authorized.msg);
        }
        else {
            userToSuspend.isSuspended = !userToSuspend.isSuspended;
            const res = await userToSuspend.save();
            return ResponseHandler_1.default.success({ user: res });
        }
    }
    async updateUserRoles(updateUserRoleDto, user) {
        return await this.usersService.updateRole(updateUserRoleDto, user);
    }
    async GetNotifications(paginationDto, user) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 4;
        return await this.usersService.getUserNotifications(paginationDto, user);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of users.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetAllUsers", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'moderator', 'manager', 'instructor'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of users.' }),
    common_1.Get('list'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetAllUsersList", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Verify token and return user.' }),
    common_1.Get('bytoken'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_dto_1.TokenDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetUserByToken", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get user profile details.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Get('/profile'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetProfileData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get user profile details.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Get('/profile/recent-activity'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [duration_dto_1.DurationDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetUserRecentActivities", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get user details by id.' }),
    common_1.Get('/details/:userId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetUserDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user details.' }),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/users-images/');
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    common_1.Post('update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateUser_dto_1.UpdateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "UpdateUserDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('superadmin'),
    swagger_1.ApiOperation({ summary: 'Update user details.' }),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/users-images/');
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    common_1.Post('update/other'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateOther_dto_1.UpdateOtherDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "UpdateOtherUserDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user basic details.' }),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/users-images/');
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    common_1.Post('updateDetails'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateBasicDetails_dto_1.UpdateBasicDetailsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "UpdateUserBasicDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user notification preferences.' }),
    common_1.Post('updatePreferences'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePreferences_dto_1.UpdatePreferencesDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "UpdateUserPreferences", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user password.' }),
    common_1.Post('updatePassword'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePassword_dto_1.UpdatePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "UpdateUserPassword", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of instructors optionally by college.' }),
    common_1.Get('instructors'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInstructors", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'moderator', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get a list of instructors for add course dropdown.' }),
    common_1.Get('/instructors/names'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInstructorNames", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'moderator', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get a list of college users for employer apply for proposal.' }),
    common_1.Get('names'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetUsersNames", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of invited instructors optionally by college.' }),
    common_1.Get('/instructors/invited'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInvitedInstructors", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get complete data for instructors section on admin panel.' }),
    common_1.Get('/instructors/admin-home'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructorSectionData_dto_1.InstructorSectionDataDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetCompleteInstructorsSectionData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a csv list of instructors optionally by college.' }),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=instructors.csv'),
    common_1.Get('/instructors/csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInstructorsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of invited instructors optionally by college as csv.' }),
    common_1.Get('/instructors/invited/csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=invited instructors.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInvitedInstructorsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of admins optionally by college.' }),
    common_1.Get('admins'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetAdmins", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of admins optionally by college.' }),
    common_1.Get('admins/csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=admins.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetAdminsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get admin profile details.' }),
    common_1.Get('/admins/details'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAdminDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get admin profile section data.' }),
    common_1.Get('/admins-profile'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAdminProfileSectionDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get instructor profile details.' }),
    common_1.Get('/admins-profile/recent-activity'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recentActivity_dto_1.RecentActivityDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAdminRecentActivity", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of invited admins optionally by college.' }),
    common_1.Get('/admins/invited'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInvitedAdmins", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Update user role.' }),
    common_1.Post('/admins/role/:userId'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Body('role')), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "UpdateUserRole", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get complete data for admin section on admin panel.' }),
    common_1.Get('/admins/admin-home'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetCompleteAdminSectionData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of invited admins optionally by college.' }),
    common_1.Get('/admins/invited/csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetInvitedAdminsCsv", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Add other users to college or admin portal.' }),
    common_1.Post('/create/other'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public' + config_1.USERS_IMG_PATH);
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
], UsersController.prototype, "addOtherUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get profile of logged in admin.' }),
    common_1.Get('data'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAdminProfileData", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get password reset link.' }),
    common_1.Post('forgotPassword'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_dto_1.EmailDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendPasswordResetLink", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Reset user password.' }),
    common_1.Post('/reset/password'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetPassword_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Check whether an email is already registered.' }),
    common_1.Post('check-email'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_dto_1.EmailDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkIfEmailExists", null);
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
], UsersController.prototype, "addCard", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get user cards.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('get-cards'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCards", null);
__decorate([
    common_1.Post('connect-account'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body('stripeToken')), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "connectStripeAccount", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Post('create-payout'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body('amount')), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createPayoutForCollege", null);
__decorate([
    common_1.Get('get-balance'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStripeAccountBalance", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get instructor details.' }),
    common_1.Get('/instructors/details'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getInstructorDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get instructor profile details.' }),
    common_1.Get('/instructors-profile'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getInstructorProfileSectionDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get instructor profile details.' }),
    common_1.Get('/instructors-profile/recent-activity'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recentActivity_dto_1.RecentActivityDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getInstructorRecentActivity", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get top performing instructors.' }),
    common_1.Get('/instructors/analytics'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetTopInstructors", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get instructor courses lists' }),
    common_1.Get('/instructors/courses'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instructorCoursesList_dto_1.InstructorCoursesListDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getInstructorCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get count of new and total college accounts added.' }),
    common_1.Get('/college-accounts/analytics'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDuration_dto_1.OptionalDurationDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "GetCollegeAccountCounts", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: `Delete user's invitation.` }),
    common_1.Delete('delete-invitation'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitationId_dto_1.InvitationIdDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "DeleteInvitation", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Delete user.' }),
    common_1.Delete(':userId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "RemoveUser", null);
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
    __metadata("design:paramtypes", [userId_dto_1.UserIdDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "SuspendUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Update user permission level.' }),
    common_1.Post('/update/roles'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateUserRole_dto_1.UpdateUserRoleDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserRoles", null);
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
], UsersController.prototype, "GetNotifications", null);
UsersController = __decorate([
    swagger_1.ApiTags('Users'),
    common_1.Controller('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        colleges_service_1.CollegesService,
        stripe_service_1.StripeService,
        userTokens_service_1.UserTokensService,
        invitations_service_1.InvitationsService,
        activities_service_1.ActivitiesService,
        payouts_service_1.PayoutsService,
        transactions_service_1.TransactionsService,
        notifications_service_1.NotificationsService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map