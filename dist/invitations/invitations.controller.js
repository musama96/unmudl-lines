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
const inviteUser_dto_1 = require("./dto/inviteUser.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const invitations_service_1 = require("./invitations.service");
const users_service_1 = require("../users/users.service");
const responseMessages_1 = require("../config/responseMessages");
const courses_service_1 = require("../courses/courses.service");
const colleges_service_1 = require("../colleges/colleges.service");
const userTokens_service_1 = require("../users/userTokens.service");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const invitationId_dto_1 = require("./dto/invitationId.dto");
const user_model_1 = require("../users/user.model");
const activities_service_1 = require("../activities/activities.service");
const activity_model_1 = require("../activities/activity.model");
const mongoose = require("mongoose");
const userActivityCategory_model_1 = require("../activities/userActivityCategory.model");
let InvitationsController = class InvitationsController {
    constructor(invitationsService, usersService, coursesService, collegesService, userTokensService, activitiesService) {
        this.invitationsService = invitationsService;
        this.usersService = usersService;
        this.coursesService = coursesService;
        this.collegesService = collegesService;
        this.userTokensService = userTokensService;
        this.activitiesService = activitiesService;
    }
    async InviteUser(inviteUserDto, user) {
        inviteUserDto.invitedBy = user._id;
        inviteUserDto.collegeId = user.collegeId ? user.collegeId : inviteUserDto.collegeId;
        if (inviteUserDto.courseId) {
            inviteUserDto.role = user_model_1.UserRoles.INSTRUCTOR;
            await this.collegesService.checkDomain(inviteUserDto.emailAddress, user.collegeId);
        }
        const existingUser = await this.usersService.checkIfEmailExists(inviteUserDto.emailAddress.toLowerCase());
        if (existingUser.data) {
            return ResponseHandler_1.default.fail((existingUser.data.collegeId ? existingUser.data.collegeId.toString() : '') === (user.collegeId ? user.collegeId.toString() : '')
                ? responseMessages_1.default.inviteUser.userAlreadyRegistered
                : 'User registered in some other college.', (existingUser.data.collegeId ? existingUser.data.collegeId.toString() : '') === (user.collegeId ? user.collegeId.toString() : '') &&
                existingUser.data.role === 'instructor'
                ? { user: existingUser }
                : null);
        }
        if (inviteUserDto.role === user_model_1.UserRoles.SUPERADMIN && user.role !== user_model_1.UserRoles.SUPERADMIN) {
            return ResponseHandler_1.default.fail('Only superadmin can add another superadmin.');
        }
        const newUser = await this.usersService.insertInvitedUser(inviteUserDto);
        const token = await this.userTokensService.createUserToken(newUser.data._id.toString());
        const invitation = await this.invitationsService.inviteUser(inviteUserDto, token);
        const activities = [
            {
                type: activity_model_1.ActivityTypes.User,
                user: mongoose.Types.ObjectId(user._id),
                otherUser: mongoose.Types.ObjectId(newUser.data._id),
                userRole: newUser.data.role,
                userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(userActivityCategory_model_1.UserActivities.InvitedUser)),
            },
        ];
        await this.activitiesService.createActivities(activities);
        return ResponseHandler_1.default.success({
            invitation: invitation.data,
        });
    }
    async ResendInvite(invitationIdDto) {
        return await this.invitationsService.resendInvitationEmail(invitationIdDto.invitationId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update user notification preferences.' }),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inviteUser_dto_1.InviteUserDto, Object]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "InviteUser", null);
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
    __metadata("design:paramtypes", [invitationId_dto_1.InvitationIdDto]),
    __metadata("design:returntype", Promise)
], InvitationsController.prototype, "ResendInvite", null);
InvitationsController = __decorate([
    swagger_1.ApiTags('Invitations'),
    common_1.Controller('invitations'),
    __metadata("design:paramtypes", [invitations_service_1.InvitationsService,
        users_service_1.UsersService,
        courses_service_1.CoursesService,
        colleges_service_1.CollegesService,
        userTokens_service_1.UserTokensService,
        activities_service_1.ActivitiesService])
], InvitationsController);
exports.InvitationsController = InvitationsController;
//# sourceMappingURL=invitations.controller.js.map