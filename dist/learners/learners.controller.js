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
const jwt_1 = require("@nestjs/jwt");
const platform_express_1 = require("@nestjs/platform-express");
const learners_service_1 = require("./learners.service");
const learnerTokens_service_1 = require("./learnerTokens.service");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const config_1 = require("../config/config");
const changePassword_dto_1 = require("../common/dto/changePassword.dto");
const createPassword_dto_1 = require("./dto/createPassword.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
const createLearner_dto_1 = require("./dto/createLearner.dto");
const resetPassword_dto_1 = require("./dto/resetPassword.dto");
const responseMessages_1 = require("../config/responseMessages");
const verifyLearner_dto_1 = require("./dto/verifyLearner.dto");
const socialSignupToken_dto_1 = require("./dto/socialSignupToken.dto");
const editPersonalInformation_dto_1 = require("./dto/editPersonalInformation.dto");
const editLocationInformation_dto_1 = require("./dto/editLocationInformation.dto");
const stripe_service_1 = require("../stripe/stripe.service");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const stripeToken_dto_1 = require("../common/dto/stripeToken.dto");
const passport_1 = require("@nestjs/passport");
const cardId_dto_1 = require("../common/dto/cardId.dto");
const courseIds_dto_1 = require("../courses/dto/courseIds.dto");
const updateProfilePhoto_dto_1 = require("./dto/updateProfilePhoto.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const fs = require("fs");
const email_phone_dto_1 = require("./dto/email-phone.dto");
const axios = require('axios');
const sharp = require('sharp');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const moment = require("moment");
const email_dto_1 = require("../common/dto/email.dto");
const phoneNumber_dto_1 = require("../common/dto/phoneNumber.dto");
const enquiries_service_1 = require("../enquiries/enquiries.service");
const source_talent_service_1 = require("../source-talent/source-talent.service");
const s3_1 = require("../s3upload/s3");
const getHelpAndSupportChats_dto_1 = require("./dto/getHelpAndSupportChats.dto");
let LearnersController = class LearnersController {
    constructor(learnersService, learnerTokenService, stripeService, jwtService, enquiriesService, sourceTalentService) {
        this.learnersService = learnersService;
        this.learnerTokenService = learnerTokenService;
        this.stripeService = stripeService;
        this.jwtService = jwtService;
        this.enquiriesService = enquiriesService;
        this.sourceTalentService = sourceTalentService;
    }
    async GetEmailValidation(emailDto) {
        return await this.learnersService.validateEmail(emailDto);
    }
    async GetPhoneNumberValidation(phoneNumberDto) {
        return await this.learnersService.validatePhoneNumber(phoneNumberDto);
    }
    async CreatePaymentMethod(stripeTokenDto, user) {
        return await this.stripeService.addLearnerPaymentMethod(stripeTokenDto.stripeToken, user);
    }
    async GetCart(user) {
        const courseIds = user.cart.map(cart => cart.course);
        return await this.learnersService.getLearnerCourses(courseIds, user._id);
    }
    async RemoveFromCart(courseIds, learner) {
        return await this.learnersService.removeCoursesFromCart(courseIds.courses, learner._id);
    }
    async RemoveFromWishList(courseIds, learner) {
        return await this.learnersService.removeCoursesFromWishList(courseIds.courses, learner._id);
    }
    async GetWishList(user) {
        const courseIds = user.wishList.map(cart => cart.course);
        return await this.learnersService.getLearnerCourses(courseIds, user._id);
    }
    async GetNotifications(paginationDto, user) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 4;
        return await this.learnersService.getLearnerNotifications(paginationDto, user);
    }
    async GetHelpAndSupport(getHelpAndSupportChatsDto, user) {
        const chats = await this.learnersService.getLearnerChats(user, getHelpAndSupportChatsDto);
        return ResponseHandler_1.default.success(chats.data);
    }
    async GetEnrollments(user) {
        return await this.learnersService.getLearnersEnrollments(user._id);
    }
    async GetPaymentMethods(user) {
        if (user.stripeCustomerId) {
            return await this.stripeService.getPaymentMethods(user.stripeCustomerId);
        }
        else {
            return ResponseHandler_1.default.success([]);
        }
    }
    async DeletePaymentMethod(cardIdDto, user) {
        if (user.stripeCustomerId) {
            return await this.stripeService.removeCustomerCard(user.stripeCustomerId, cardIdDto.cardId);
        }
        else {
            return ResponseHandler_1.default.fail(`You aren't registered with stripe.`);
        }
    }
    async CreateLearner(createLearnerDto) {
        if (createLearnerDto.emailAddress) {
            const existingLearner = await this.learnersService.getLearnerByEmail(createLearnerDto.emailAddress);
            if (existingLearner) {
                ResponseHandler_1.default.fail(responseMessages_1.default.common.emailRegistered);
            }
        }
        else {
            const existingLearner = await this.learnersService.getLearnerByPhoneNumber(createLearnerDto.phoneNumber);
            if (existingLearner) {
                ResponseHandler_1.default.fail(responseMessages_1.default.common.phoneNumberRegistered);
            }
        }
        const res = await this.learnersService.insertLearner(createLearnerDto);
        const learner = res.data;
        const verification = await this.learnersService.sendVerificationLink(learner);
        if (verification) {
            return ResponseHandler_1.default.success({ learner }, learner.emailAddress ? responseMessages_1.default.createLearner.emailSent : responseMessages_1.default.createLearner.messageSent);
        }
        else {
            return ResponseHandler_1.default.fail(learner.emailAddress ? responseMessages_1.default.createLearner.emailError : responseMessages_1.default.createLearner.messageError);
        }
    }
    async ResendVerificationCode(emailDto) {
        const learner = emailDto.emailAddress
            ? await this.learnersService.getLearnerByEmail(emailDto.emailAddress)
            : await this.learnersService.getLearnerByPhoneNumber(emailDto.phoneNumber);
        if (!learner) {
            return ResponseHandler_1.default.fail('User does not exist');
        }
        const verification = await this.learnersService.sendVerificationLink(learner);
        if (verification) {
            return ResponseHandler_1.default.success({}, responseMessages_1.default.createLearner.emailSent);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.createLearner.emailError);
        }
    }
    async SignInUsingGoogle(googleTokenDto) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: googleTokenDto.token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            if (!ticket) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
            }
            const payload = ticket.getPayload();
            let learner = await this.learnersService.getLearnerByEmail(payload.email);
            if (!learner) {
                learner = await this.learnersService.insertLearner({
                    emailAddress: payload.email,
                    firstname: payload.given_name,
                    lastname: payload.family_name,
                    profilePhoto: payload.picture,
                    password: '',
                    isVerified: true,
                });
                learner = learner.data;
            }
            learner.firstname = payload.given_name ? payload.given_name : learner.firstname;
            learner.lastname = payload.family_name ? payload.family_name : learner.lastname;
            learner.fullname = learner.firstname + ' ' + learner.lastname;
            learner.lastLoggedIn = new Date();
            const image = await axios.request({
                responseType: 'arraybuffer',
                url: payload.picture,
                method: 'get',
            });
            const photo = process.env.LEARNERS_IMG_PATH + learner._id + '.jpg';
            fs.writeFileSync('./public' + photo, image.data);
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                let files = { file: [{ destination: config_1.LEARNERS_IMG_PATH, filename: `${learner._id}.jpg` }] };
                files.file[0].buffer = fs.readFileSync(`public${photo}`);
                s3_1.moveFilesToS3(config_1.LEARNERS_IMG_PATH, files);
            }
            learner.profilePhoto = photo;
            learner.profilePhotoThumbnail = photo;
            learner = await learner.save();
            const tokenPayload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
            const accessToken = this.jwtService.sign(tokenPayload);
            return ResponseHandler_1.default.success({
                accessToken,
                learner: {
                    _id: learner._id,
                    firstname: learner.firstname,
                    lastname: learner.lastname,
                    fullname: learner.fullname,
                    ethnicity: learner.ethnicity ? learner.ethnicity : null,
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
                    createdAt: learner.createdAt,
                    imageData: image.data,
                },
            });
        }
        catch (err) {
            return ResponseHandler_1.default.fail(err.message);
        }
    }
    async SignInUsingLinkedin(socialSignupTokenDto) {
        try {
            const body = new URLSearchParams({
                grant_type: process.env.LINKEDIN_GRANT_TYPE,
                code: socialSignupTokenDto.token,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
                client_id: process.env.LINKEDIN_CLIENT,
                client_secret: process.env.LINKEDIN_SECRET,
            });
            const res = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', body);
            const userData = await axios.get('https://api.linkedin.com/v2/me', {
                headers: { Authorization: `Bearer ${res.data.access_token}` },
            });
            const emailData = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
                headers: { Authorization: `Bearer ${res.data.access_token}` },
            });
            const email = emailData.data.elements[0]['handle~'].emailAddress;
            let learner = await this.learnersService.getLearnerByEmail(email);
            if (!learner) {
                learner = await this.learnersService.insertLearner({
                    emailAddress: email,
                    firstname: userData.data.localizedFirstName,
                    lastname: userData.data.localizedLastName,
                    password: '',
                    isVerified: true,
                });
                learner = learner.data;
            }
            learner.firstname = userData.data.localizedFirstName ? userData.data.localizedFirstName : learner.firstname;
            learner.lastname = userData.data.localizedLastName ? userData.data.localizedLastName : learner.lastname;
            learner.fullname = learner.firstname + ' ' + learner.lastname;
            learner.lastLoggedIn = new Date();
            learner = await learner.save();
            const tokenPayload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
            const accessToken = this.jwtService.sign(tokenPayload);
            return ResponseHandler_1.default.success({
                accessToken,
                learner: {
                    _id: learner._id,
                    firstname: learner.firstname,
                    lastname: learner.lastname,
                    fullname: learner.fullname,
                    ethnicity: learner.ethnicity ? learner.ethnicity : null,
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
                    createdAt: learner.createdAt,
                },
            });
        }
        catch (err) {
            return ResponseHandler_1.default.fail(err.response.data.message);
        }
    }
    async SignInUsingFacebook(socialSignupTokenDto) {
        try {
            const clientId = process.env.FACEBOOK_CLIENT_ID;
            const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
            let response = await axios.get(`https://graph.facebook.com/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=email`);
            const appToken = response.data.access_token;
            response = await axios.get(`https://graph.facebook.com/debug_token?input_token=${socialSignupTokenDto.token}&access_token=${appToken}`);
            const { app_id, is_valid, user_id } = response.data.data;
            if (app_id !== clientId) {
                ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidClientId);
            }
            if (!is_valid) {
                ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
            }
            response = await axios.get(`https://graph.facebook.com/v2.11/${user_id}?fields=id,first_name,last_name,picture,email&access_token=${socialSignupTokenDto.token}`);
            const { picture, email, first_name, last_name } = response.data;
            let learner = await this.learnersService.getLearnerByEmail(email);
            if (!learner) {
                response = await this.learnersService.insertLearner({
                    emailAddress: email,
                    firstname: first_name,
                    lastname: last_name,
                    password: '',
                    isVerified: true,
                });
                learner = response.data;
            }
            learner.firstname = first_name ? first_name : learner.firstname;
            learner.lastname = last_name ? last_name : learner.lastname;
            learner.fullname = learner.firstname + ' ' + learner.lastname;
            learner.lastLoggedIn = new Date();
            if (picture.data.url) {
                const image = await axios.request({
                    responseType: 'arraybuffer',
                    url: picture.data.url,
                    method: 'get',
                });
                const photo = process.env.LEARNERS_IMG_PATH + learner._id + '.jpg';
                fs.writeFileSync('./public' + photo, image.data);
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    let files = { file: [{ destination: config_1.LEARNERS_IMG_PATH, filename: `${learner._id}.jpg` }] };
                    files.file[0].buffer = fs.readFileSync(`public${photo}`);
                    s3_1.moveFilesToS3(config_1.LEARNERS_IMG_PATH, files);
                }
                learner.profilePhoto = photo;
                learner.profilePhotoThumbnail = photo;
            }
            else {
                learner.profilePhoto = '';
            }
            learner = await learner.save();
            const tokenPayload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
            const accessToken = this.jwtService.sign(tokenPayload);
            return ResponseHandler_1.default.success({
                accessToken,
                learner: {
                    _id: learner._id,
                    firstname: learner.firstname,
                    lastname: learner.lastname,
                    fullname: learner.fullname,
                    ethnicity: learner.ethnicity ? learner.ethnicity : null,
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
                    createdAt: learner.createdAt,
                },
            });
        }
        catch (err) {
            return ResponseHandler_1.default.fail(err.message);
        }
    }
    async VerifyLearner(verifyLearnerDto) {
        const learner = verifyLearnerDto.emailAddress
            ? await this.learnersService.getLearnerByEmail(verifyLearnerDto.emailAddress)
            : await this.learnersService.getLearnerByPhoneNumber(verifyLearnerDto.phoneNumber);
        if (!learner) {
            return ResponseHandler_1.default.fail('No user found.');
        }
        verifyLearnerDto.learnerId = learner ? learner._id : '';
        const token = await this.learnerTokenService.validateVerificationCode(verifyLearnerDto);
        if (!token) {
            ResponseHandler_1.default.fail(responseMessages_1.default.createLearner.invalidVerificationCode);
        }
        else {
            return await this.learnersService.verifyLearner(verifyLearnerDto.learnerId);
        }
    }
    async sendPasswordResetLink(emailDto) {
        const learner = emailDto.emailAddress
            ? await this.learnersService.getLearnerByEmail(emailDto.emailAddress)
            : await this.learnersService.getLearnerByPhoneNumber(emailDto.phoneNumber);
        if (learner) {
            if (emailDto.phoneNumber && learner.emailAddress) {
                delete learner.emailAddress;
            }
            const linkSent = await this.learnersService.sendResetPasswordLink(learner);
            if (linkSent) {
                return ResponseHandler_1.default.success({
                    message: `Password reset link sent to your ${learner.emailAddress ? 'email address' : 'phone number'}`,
                });
            }
            else {
                return ResponseHandler_1.default.fail(`Unable to send ${learner.emailAddress ? 'email' : 'message'}`);
            }
        }
        else {
            return ResponseHandler_1.default.fail(emailDto.emailAddress ? 'Email not found.' : 'Phone number not found.');
        }
    }
    async resetPassword(resetPasswordDto) {
        const token = await this.learnerTokenService.verifyCode(resetPasswordDto);
        if (token) {
            const updatePassword = await this.learnersService.updatePassword(resetPasswordDto.password, token.learnerId);
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
    async UpdateProfilePhoto(updateProfilePhotoDto, learner, files) {
        if (files && files.file) {
            await sharp(files.file[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.file[0].path.replace('.', '_t.'));
            updateProfilePhotoDto.profilePhotoThumbnail = (config_1.LEARNERS_IMG_PATH + files.file[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.LEARNERS_IMG_PATH, files);
                files.file[0].buffer = fs.readFileSync(files.file[0].path);
                files.profilePhotoThumbnail = [
                    Object.assign(Object.assign({}, files.file[0]), { buffer: await sharp(files.file[0].path)
                            .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.file[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.LEARNERS_IMG_PATH, files);
            }
        }
        updateProfilePhotoDto.profilePhoto = files && files.file ? config_1.LEARNERS_IMG_PATH + files.file[0].filename : '';
        const update = await this.learnersService.updateLearner(updateProfilePhotoDto, learner._id);
        return update
            ? ResponseHandler_1.default.success({ profilePhoto: update.profilePhoto }, 'Profile photo updated successfully')
            : ResponseHandler_1.default.fail('Unable to update profile photo.');
    }
    async UpdatePersonalInformation(editPersonalInformationDto, learner) {
        if (editPersonalInformationDto.emailAddress) {
            const existingLearner = await this.learnersService.getLearnerByEmail(editPersonalInformationDto.emailAddress);
            if (existingLearner && existingLearner._id.toString() !== learner._id.toString()) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.emailRegistered);
            }
        }
        if (editPersonalInformationDto.phoneNumber) {
            const existingLearner = await this.learnersService.getLearnerByPhoneNumber(editPersonalInformationDto.phoneNumber);
            if (existingLearner && existingLearner._id.toString() !== learner._id.toString()) {
                return ResponseHandler_1.default.fail(responseMessages_1.default.common.phoneNumberRegistered);
            }
        }
        editPersonalInformationDto.emailAddress = editPersonalInformationDto.emailAddress ? editPersonalInformationDto.emailAddress : '';
        editPersonalInformationDto.phoneNumber = editPersonalInformationDto.phoneNumber ? editPersonalInformationDto.phoneNumber : '';
        editPersonalInformationDto.fullname = editPersonalInformationDto.firstname + ' ' + editPersonalInformationDto.lastname;
        const updatedLearner = await this.learnersService.updateLearner(editPersonalInformationDto, learner._id);
        return ResponseHandler_1.default.success({ updatedLearner });
    }
    async UpdateLocation(editLocationInformationDto, learner) {
        const updatedLearner = await this.learnersService.updateLearner(editLocationInformationDto, learner._id);
        return ResponseHandler_1.default.success({ updatedLearner });
    }
    async UpdatePassword(changePasswordDto, learner) {
        return await this.learnersService.changePassword(changePasswordDto, learner._id);
    }
    async CreatePassword(createPasswordDto, learner) {
        return await this.learnersService.createPassword(createPasswordDto, learner._id);
    }
    async TestMailLog() {
        return await this.learnersService.testMailLog();
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get email validated.' }),
    common_1.Get('email/validation'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_dto_1.EmailDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetEmailValidation", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get phoneNumber validated.' }),
    common_1.Get('phone-number/validation'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [phoneNumber_dto_1.PhoneNumberDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetPhoneNumberValidation", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Add learner payment method.' }),
    common_1.Post('payment-method'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stripeToken_dto_1.StripeTokenDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "CreatePaymentMethod", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get learner cart.' }),
    common_1.Get('cart'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetCart", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Remove course from learner cart.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('remove/from-cart'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseIds_dto_1.CourseIdsDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "RemoveFromCart", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Remove course from learner cart.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('remove/from-wishlist'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [courseIds_dto_1.CourseIdsDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "RemoveFromWishList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get learner wishList.' }),
    common_1.Get('wishList'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetWishList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get learner wishList.' }),
    common_1.Get('notifications'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetNotifications", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get learner wishList.' }),
    common_1.Get('help&support'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getHelpAndSupportChats_dto_1.GetHelpAndSupportChatsDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetHelpAndSupport", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get learner enrollments.' }),
    common_1.Get('enrollments'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetEnrollments", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get learner payment methods.' }),
    common_1.Get('payment-method'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "GetPaymentMethods", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Delete learner payment method.' }),
    common_1.Delete('payment-method'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cardId_dto_1.CardIdDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "DeletePaymentMethod", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Learners Signup' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('create'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createLearner_dto_1.CreateLearnerDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "CreateLearner", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Resend Signup verification code' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('resend/verification-code'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_phone_dto_1.EmailPhoneDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "ResendVerificationCode", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Learners Google Signup' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('/google/signup'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socialSignupToken_dto_1.SocialSignupTokenDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "SignInUsingGoogle", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Learners Facebook Signup' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('/linkedin/signup'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socialSignupToken_dto_1.SocialSignupTokenDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "SignInUsingLinkedin", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Learners Facebook Signup' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('/facebook/signup'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socialSignupToken_dto_1.SocialSignupTokenDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "SignInUsingFacebook", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Learners Verification' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('verify'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verifyLearner_dto_1.VerifyLearnerDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "VerifyLearner", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get password reset link.' }),
    common_1.Post('forgotPassword'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_phone_dto_1.EmailPhoneDto]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "sendPasswordResetLink", null);
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
], LearnersController.prototype, "resetPassword", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update learners personal information.' }),
    common_1.Post('update-profilePhoto'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public' + config_1.LEARNERS_IMG_PATH);
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
    __metadata("design:paramtypes", [updateProfilePhoto_dto_1.UpdateProfilePhotoDto, Object, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "UpdateProfilePhoto", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update learners personal information.' }),
    common_1.Post('update-personalInformation'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editPersonalInformation_dto_1.EditPersonalInformationDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "UpdatePersonalInformation", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update learners location information.' }),
    common_1.Post('location-information'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editLocationInformation_dto_1.EditLocationInformationDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "UpdateLocation", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Update learners password.' }),
    common_1.Post('update-password'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [changePassword_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "UpdatePassword", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create new password for socially logged users.' }),
    common_1.Post('create-password'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPassword_dto_1.CreatePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "CreatePassword", null);
__decorate([
    common_1.Get('testMailLog'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LearnersController.prototype, "TestMailLog", null);
LearnersController = __decorate([
    swagger_1.ApiTags('Learners (User Portal)'),
    common_1.Controller('learners'),
    __metadata("design:paramtypes", [learners_service_1.LearnersService,
        learnerTokens_service_1.LearnerTokensService,
        stripe_service_1.StripeService,
        jwt_1.JwtService,
        enquiries_service_1.EnquiriesService,
        source_talent_service_1.SourceTalentService])
], LearnersController);
exports.LearnersController = LearnersController;
//# sourceMappingURL=learners.controller.js.map