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
const users_service_1 = require("../users/users.service");
const learners_service_1 = require("../learners/learners.service");
const jwt_1 = require("@nestjs/jwt");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const mongoose_1 = require("@nestjs/mongoose");
const moment = require("moment");
const employer_admins_service_1 = require("../employer-admins/employer-admins.service");
const learner_model_1 = require("../learners/learner.model");
const employer_subscriptions_service_1 = require("../employer-subscriptions/employer-subscriptions.service");
let AuthService = class AuthService {
    constructor(usersService, employerAdminsService, learnersService, jwtService, employerSubscriptionsService, collegeModel) {
        this.usersService = usersService;
        this.employerAdminsService = employerAdminsService;
        this.learnersService = learnersService;
        this.jwtService = jwtService;
        this.employerSubscriptionsService = employerSubscriptionsService;
        this.collegeModel = collegeModel;
    }
    async userLogin(authCredentialsDto, isCollegeUser) {
        const user = await this.usersService.validateUserForLogin(authCredentialsDto);
        if (!user || (isCollegeUser && !user.collegeId) || (!isCollegeUser && user.collegeId)) {
            throw new common_1.UnauthorizedException('Invalid Credentials');
        }
        if (user.isSuspended || (user.invitation && user.invitation !== 'accepted')) {
            return ResponseHandler_1.default.fail(user.invitation !== 'accepted' ? responseMessages_1.default.login.pendingInvite : responseMessages_1.default.login.suspended);
        }
        if (user.collegeId && user.collegeId.isSuspended) {
            return ResponseHandler_1.default.fail(`Your college's account is suspended by UNMUDL.`);
        }
        await this.usersService.updateLastLoggedIn(user._id);
        const payload = { _id: user._id, emailAddress: user.emailAddress, type: 'user' };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                emailAddress: user.emailAddress,
                profilePhoto: user.profilePhoto,
                profilePhotoThumbnail: user.profilePhotoThumbnail,
                collegeId: user.collegeId ? user.collegeId._id : null,
                college: user.collegeId ? user.collegeId.title : null,
                collegeDomain: user.collegeId ? user.collegeId.domain : null,
                orgId: user.collegeId ? user.collegeId.orgId : null,
                role: user.role,
            },
        };
    }
    async employerLogin(authCredentialsDto) {
        const admin = await this.employerAdminsService.validateEmployerAdminForLogin(authCredentialsDto);
        if (admin) {
            if (admin.invitation && admin.invitation !== 'accepted') {
                return ResponseHandler_1.default.fail(responseMessages_1.default.login.pendingInvite);
            }
            if (admin.isSuspended) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.login.suspended);
            }
            if (admin.employerId && admin.employerId.isSuspended) {
                return ResponseHandler_1.default.fail(`Your employer's account is suspended by UNMUDL.`);
            }
            await this.employerAdminsService.updateLastLoggedIn(admin._id);
            const payload = { _id: admin._id, emailAddress: admin.emailAddress, type: 'employer' };
            const accessToken = this.jwtService.sign(payload);
            const { data: activeSubscription } = await this.employerSubscriptionsService.getActiveSubscription(admin.employerId);
            return {
                accessToken,
                user: {
                    _id: admin._id,
                    fullname: admin.fullname,
                    username: admin.username,
                    emailAddress: admin.emailAddress,
                    profilePhoto: admin.profilePhoto,
                    profilePhotoThumbnail: admin.profilePhotoThumbnail,
                    employerId: admin.employerId ? admin.employerId._id : null,
                    employer: admin.employerId ? admin.employerId.title : null,
                    employerAddress: admin.employerId ? admin.employerId.address : null,
                    employerDomain: admin.employerId ? admin.employerId.domain : null,
                    employerLogo: admin.employerId ? admin.employerId.employerLogo : null,
                    employerBanner: admin.employerId ? admin.employerId.employerBanner : null,
                    employerLogoThumbnail: admin.employerId ? admin.employerId.employerLogoThumbnail : null,
                    zip: admin.employerId ? admin.employerId.zip : null,
                    role: admin.role,
                    activeSubscription,
                },
            };
        }
        else {
            throw new common_1.UnauthorizedException('Invalid Credentials');
        }
    }
    async login(authCredentialsDto) {
        const user = await this.usersService.validateUserForLogin(authCredentialsDto);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid Credentials');
        }
        if (user.isSuspended || (user.invitation && user.invitation !== 'accepted')) {
            return ResponseHandler_1.default.fail(user.invitation !== 'accepted' ? responseMessages_1.default.login.pendingInvite : responseMessages_1.default.login.suspended);
        }
        if (user.collegeId && user.collegeId.isSuspended) {
            return ResponseHandler_1.default.fail(`Your college's account is suspended by UNMUDL.`);
        }
        await this.usersService.updateLastLoggedIn(user._id);
        const payload = { _id: user._id, emailAddress: user.emailAddress, type: 'user' };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                emailAddress: user.emailAddress,
                profilePhoto: user.profilePhoto,
                profilePhotoThumbnail: user.profilePhotoThumbnail,
                collegeId: user.collegeId ? user.collegeId._id : null,
                college: user.collegeId ? user.collegeId.title : null,
                collegeDomain: user.collegeId ? user.collegeId.domain : null,
                role: user.role,
            },
        };
    }
    async learnerLogin(authCredentialsDto) {
        const learner = await this.learnersService.validateLearnerForLogin(authCredentialsDto);
        if (!learner) {
            throw new common_1.UnauthorizedException('Invalid Credentials');
        }
        if (!learner.isVerified) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.login.unverified);
        }
        if (learner.isSuspended) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.login.suspended);
        }
        await this.learnersService.updateLastLoggedIn(learner._id);
        const payload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
        const accessToken = this.jwtService.sign(payload);
        return ResponseHandler_1.default.success({
            accessToken,
            learner: {
                _id: learner._id,
                firstname: learner.firstname,
                lastname: learner.lastname,
                fullname: learner.fullname,
                gender: learner.gender ? learner.gender : learner_model_1.Gender.PREFER_NOT_TO_RESPOND,
                ethnicity: learner.ethnicity ? learner.ethnicity : learner_model_1.Ethnicity.PREFER_NOT_TO_RESPOND,
                profilePhoto: learner.profilePhoto,
                profilePhotoThumbnail: learner.profilePhotoThumbnail,
                emailAddress: learner.emailAddress,
                phoneNumber: learner.phoneNumber,
                address: learner.address,
                city: learner.city,
                state: learner.state,
                country: learner.country,
                zip: learner.zip,
                cartCoursesCount: learner.cart ? learner.cart.length : 0,
                coordinates: learner.coordinates,
                dateOfBirth: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : null,
                primarySignup: learner.primarySignup,
                veteranBenefits: learner.veteranBenefits,
                militaryStatus: learner.militaryStatus,
                isSpouseActive: learner.isSpouseActive,
                militaryBenefit: learner.militaryBenefit,
                wioaBenefits: learner.wioaBenefits,
                createdAt: learner.createdAt,
            },
        });
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __param(5, mongoose_1.InjectModel('colleges')),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        employer_admins_service_1.EmployerAdminsService,
        learners_service_1.LearnersService,
        jwt_1.JwtService,
        employer_subscriptions_service_1.EmployerSubscriptionsService, Object])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map