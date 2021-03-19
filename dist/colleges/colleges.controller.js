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
const signUpCollege_dto_1 = require("./dto/signUpCollege.dto");
const list_dto_1 = require("../common/dto/list.dto");
const colleges_service_1 = require("./colleges.service");
const users_service_1 = require("../users/users.service");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const updateCollege_dto_1 = require("./dto/updateCollege.dto");
const config_1 = require("../config/config");
const optionalDurationPagination_dto_1 = require("../common/dto/optionalDurationPagination.dto");
const stripe_service_1 = require("../stripe/stripe.service");
const payouts_service_1 = require("../payouts/payouts.service");
const analyticsCount_dto_1 = require("../common/dto/analyticsCount.dto");
const getCount_dto_1 = require("../common/dto/getCount.dto");
const collegeId_dto_1 = require("../common/dto/collegeId.dto");
const interval_dto_1 = require("../common/dto/interval.dto");
const token_dto_1 = require("../users/dto/token.dto");
const college_invitations_service_1 = require("../college-invitations/college-invitations.service");
const financeSummary_dto_1 = require("./dto/financeSummary.dto");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const activities_service_1 = require("../activities/activities.service");
const recentActivity_dto_1 = require("../users/dto/recentActivity.dto");
const transactionActivityCsv_dto_1 = require("../activities/dto/transactionActivityCsv.dto");
const partnerGroupId_dto_1 = require("../common/dto/partnerGroupId.dto");
const updatePartnerCommission_dto_1 = require("./dto/updatePartnerCommission.dto");
const notifications_service_1 = require("../notifications/notifications.service");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
const json2csv = require("json2csv");
const moment = require("moment");
const sharp = require("sharp");
const adminHomeDto_dto_1 = require("./dto/adminHomeDto.dto");
const stats_dto_1 = require("./dto/stats.dto");
const responseMessages_1 = require("../config/responseMessages");
const ResponseHandler_1 = require("../common/ResponseHandler");
const location_dto_1 = require("./dto/location.dto");
const enrollments_service_1 = require("../enrollments/enrollments.service");
const optionalCollegeId_dto_1 = require("../common/dto/optionalCollegeId.dto");
const s3_1 = require("../s3upload/s3");
const fs = require("fs");
const collegesList_dto_1 = require("./dto/collegesList.dto");
let CollegesController = class CollegesController {
    constructor(collegesService, collegeInvitationsService, usersService, stripeService, payoutService, activitiesService, notificationsService, enrollmentsService) {
        this.collegesService = collegesService;
        this.collegeInvitationsService = collegeInvitationsService;
        this.usersService = usersService;
        this.stripeService = stripeService;
        this.payoutService = payoutService;
        this.activitiesService = activitiesService;
        this.notificationsService = notificationsService;
        this.enrollmentsService = enrollmentsService;
    }
    async GetCollegeByToken(tokenDto) {
        const token = await this.collegesService.verifyToken(encodeURIComponent(tokenDto.token));
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        return ResponseHandler_1.default.success(token.college);
    }
    async create(signUpCollegeDto, files) {
        const token = await this.collegesService.verifyToken(encodeURIComponent(signUpCollegeDto.token), true);
        if (!token) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.common.invalidToken);
        }
        signUpCollegeDto._id = token.college._id;
        if (files && files.collegeLogo) {
            await sharp(files.collegeLogo[0].path)
                .resize(config_1.COLLEGE_LOGO_THUMBNAIL_SIZE)
                .toFile(files.collegeLogo[0].path.replace('.', '_t.'));
            signUpCollegeDto.collegeLogoThumbnail = (config_1.COLLEGES_IMG_PATH + files.collegeLogo[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGES_IMG_PATH, files);
                files.collegeLogo[0].buffer = fs.readFileSync(files.collegeLogo[0].path);
                files.collegeLogoThumbnail = [
                    Object.assign(Object.assign({}, files.collegeLogo[0]), { buffer: await sharp(files.collegeLogo[0].path)
                            .resize(config_1.COLLEGE_LOGO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.collegeLogo[0].filename.replace('.', '_t.') }),
                ];
                if (files && files.collegeBanner) {
                    files.collegeBanner[0].buffer = fs.readFileSync(files.collegeBanner[0].path);
                }
                s3_1.moveFilesToS3(config_1.COLLEGES_IMG_PATH, files);
            }
        }
        signUpCollegeDto.collegeLogo = files && files.collegeLogo ? config_1.COLLEGES_IMG_PATH + files.collegeLogo[0].filename : '';
        signUpCollegeDto.collegeBanner = files && files.collegeBanner ? config_1.COLLEGES_IMG_PATH + files.collegeBanner[0].filename : '';
        signUpCollegeDto.invitation = 'accepted';
        const college = await this.collegesService.updateCollege(signUpCollegeDto);
        const invitation = await this.collegeInvitationsService.updateAcceptedInvitation(college.data._id);
        signUpCollegeDto.collegeId = college.data._id;
        signUpCollegeDto.role = 'superadmin';
        if (files && files.profilePhoto) {
            await sharp(files.profilePhoto[0].path)
                .resize(config_1.PROFILE_PHOTO_THUMBNAIL_SIZE)
                .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
            signUpCollegeDto.profilePhotoThumbnail = (config_1.USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');
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
        signUpCollegeDto.profilePhoto = files && files.profilePhoto ? config_1.USERS_IMG_PATH + files.profilePhoto[0].filename : '';
        const user = await this.usersService.updateCollegeAdmin({
            emailAddress: invitation.emailAddress,
            fullname: signUpCollegeDto.fullname,
            password: signUpCollegeDto.password,
            profilePhoto: signUpCollegeDto.profilePhoto,
            profilePhotoThumbnail: signUpCollegeDto.profilePhotoThumbnail,
            designation: signUpCollegeDto.designation,
            invitation: 'accepted',
        });
        const { fullname, emailAddress, role, collegeId, designation } = user;
        const userResponse = { fullname, emailAddress, role, collegeId, designation };
        const collegeResponse = college.data;
        delete collegeResponse.salesTax;
        delete collegeResponse.unmudlShare;
        this.notificationsService.collegeJoined(collegeResponse, invitation.invitedBy);
        return ResponseHandler_1.default.success({
            user: userResponse,
            college: collegeResponse,
        });
    }
    async Update(collegeIdDto, updateCollegeDto, files) {
        if (files && files.collegeLogo) {
            await sharp(files.collegeLogo[0].path)
                .resize(config_1.COLLEGE_LOGO_THUMBNAIL_SIZE)
                .toFile(files.collegeLogo[0].path.replace('.', '_t.'));
            updateCollegeDto.collegeLogoThumbnail = (config_1.COLLEGES_IMG_PATH + files.collegeLogo[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGES_IMG_PATH, files);
                files.collegeLogo[0].buffer = fs.readFileSync(files.collegeLogo[0].path);
                files.collegeLogoThumbnail = [
                    Object.assign(Object.assign({}, files.collegeLogo[0]), { buffer: await sharp(files.collegeLogo[0].path)
                            .resize(config_1.COLLEGE_LOGO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.collegeLogo[0].filename.replace('.', '_t.') }),
                ];
                if (files && files.collegeBanner) {
                    files.collegeBanner[0].buffer = fs.readFileSync(files.collegeBanner[0].path);
                }
                s3_1.moveFilesToS3(config_1.COLLEGES_IMG_PATH, files);
            }
        }
        else {
            updateCollegeDto.collegeLogoThumbnail = updateCollegeDto.collegeLogoPath
                ? updateCollegeDto.collegeLogoPath.replace('.', '_t.')
                : null;
        }
        updateCollegeDto.collegeLogo =
            files && files.collegeLogo ? config_1.COLLEGES_IMG_PATH + files.collegeLogo[0].filename : updateCollegeDto.collegeLogoPath;
        updateCollegeDto.collegeBanner =
            files && files.collegeBanner ? config_1.COLLEGES_IMG_PATH + files.collegeBanner[0].filename : updateCollegeDto.collegeBannerPath;
        updateCollegeDto._id = collegeIdDto.collegeId;
        updateCollegeDto.streetAddress = updateCollegeDto.streetAddress ? updateCollegeDto.streetAddress : null;
        const college = await this.collegesService.updateCollege(updateCollegeDto);
        const collegeResponse = college.data;
        delete collegeResponse.salesTax;
        delete collegeResponse.unmudlShare;
        return ResponseHandler_1.default.success({
            college: collegeResponse,
        });
    }
    async updatePartnerCommission(updatePartnerCommissionDto, collegeIdDto) {
        return await this.collegesService.updatePartnerCommission(collegeIdDto.collegeId, updatePartnerCommissionDto.commission);
    }
    async updatePartnerGroup(collegeIdDto, partnerGroupIdDto) {
        return await this.collegesService.updatePartnerGroup(collegeIdDto.collegeId, partnerGroupIdDto.partnerGroupId);
    }
    async checkIfEmailExists(emailAddress) {
        return await this.usersService.checkIfEmailExists(emailAddress.toLowerCase());
    }
    async getCollegesByLocation(locationDto) {
        return await this.collegesService.getCollegesByLocation(locationDto);
    }
    async getCollegesByLocationForEmployerPortal(locationDto, user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        return await this.collegesService.getCollegesByLocationForEmployerPortal(locationDto, user);
    }
    async getCollegesForEmployerPortal(keywordDto, user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        return await this.collegesService.getCollegesForEmployerPortal(keywordDto.keyword ? keywordDto.keyword : '', user);
    }
    async GetUsersCollege(collegeIdDto, user) {
        if (!user.collegeId && !collegeIdDto.collegeId) {
            ResponseHandler_1.default.fail(responseMessages_1.default.common.requiredCollegeId);
        }
        collegeIdDto.collegeId = user.collegeId ? user.collegeId : collegeIdDto.collegeId;
        const [college, recentActivities] = await Promise.all([
            this.collegesService.getCollegeById(collegeIdDto.collegeId),
            this.activitiesService.getActivities({
                type: 'user',
                collegeId: collegeIdDto.collegeId,
                start: new Date(moment()
                    .subtract(1, 'd')
                    .toISOString()),
                end: new Date(),
                page: 1,
                perPage: Infinity,
            }),
        ]);
        return ResponseHandler_1.default.success({ college: college.data, recentActivities: recentActivities.data });
    }
    async GetCollegeRecentActivity(user, recentActivityDto) {
        const collegeId = user.collegeId ? user.collegeId : recentActivityDto.collegeId;
        if (collegeId) {
            const recentActivities = await this.activitiesService.getActivities({
                collegeId,
                start: new Date(recentActivityDto.start),
                end: new Date(recentActivityDto.end),
                page: 1,
                perPage: Infinity,
            });
            return ResponseHandler_1.default.success(recentActivities.data);
        }
        else {
            return ResponseHandler_1.default.fail('College Id is required');
        }
    }
    async UpdateCollegeProfile(updateCollegeDto, user, files) {
        if (!user.collegeId) {
            ResponseHandler_1.default.fail(responseMessages_1.default.common.requiredCollegeId);
        }
        updateCollegeDto._id = user.collegeId;
        updateCollegeDto.streetAddress = updateCollegeDto.streetAddress ? updateCollegeDto.streetAddress : null;
        updateCollegeDto.collegeLogo = updateCollegeDto.collegeLogoPath;
        updateCollegeDto.collegeLogoThumbnail = updateCollegeDto.collegeLogoPath ? updateCollegeDto.collegeLogoPath.replace('.', '_t.') : null;
        if (files && files.collegeLogo && files.collegeLogo[0]) {
            updateCollegeDto.collegeLogo = config_1.COLLEGES_IMG_PATH + files.collegeLogo[0].filename;
            await sharp(files.collegeLogo[0].path)
                .resize(config_1.COLLEGE_LOGO_THUMBNAIL_SIZE)
                .toFile(files.collegeLogo[0].path.replace('.', '_t.'));
            updateCollegeDto.collegeLogoThumbnail = (config_1.COLLEGES_IMG_PATH + files.collegeLogo[0].filename).replace('.', '_t.');
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGES_IMG_PATH, files);
                files.collegeLogo[0].buffer = fs.readFileSync(files.collegeLogo[0].path);
                files.collegeLogoThumbnail = [
                    Object.assign(Object.assign({}, files.collegeLogo[0]), { buffer: await sharp(files.collegeLogo[0].path)
                            .resize(config_1.COLLEGE_LOGO_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.collegeLogo[0].filename.replace('.', '_t.') }),
                ];
                if (files && files.collegeBanner) {
                    files.collegeBanner[0].buffer = fs.readFileSync(files.collegeBanner[0].path);
                }
                s3_1.moveFilesToS3(config_1.COLLEGES_IMG_PATH, files);
            }
        }
        updateCollegeDto.collegeBanner = updateCollegeDto.collegeBannerPath;
        if (files && files.collegeBanner && files.collegeBanner[0]) {
            updateCollegeDto.collegeBanner = config_1.COLLEGES_IMG_PATH + files.collegeBanner[0].filename;
        }
        return await this.collegesService.updateCollege(updateCollegeDto);
    }
    async GetColleges(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
        listDto.state = listDto.state ? listDto.state : '';
        return await this.collegesService.getColleges(listDto);
    }
    async GetCollegeNamesList(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 50;
        return await this.collegesService.getCollegeNamesList(listDto);
    }
    async getCollegeNamesListForEmployerPortal(listDto, user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
        listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
        listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 50;
        return await this.collegesService.getCollegeNamesListForEmployerPortal(listDto, user);
    }
    async GetCollegesDropdown(keywordDto, user) {
        return await this.collegesService.getCollegesDropdown(keywordDto.keyword);
    }
    async GetCollegeDashboard(adminHomeDto, user) {
        adminHomeDto.perPage = Number(adminHomeDto.perPage) ? Number(adminHomeDto.perPage) : 10;
        adminHomeDto.interval = Number(adminHomeDto.interval);
        const [revenueStats, { data: totalColleges }, { data: newColleges }, growth, partners] = await Promise.all([
            this.collegesService.getCollegesRevenue({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
            this.collegesService.getCollegesCount({}),
            this.collegesService.getCollegesCount({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
            this.collegesService.getCollegeGrowth({
                start: adminHomeDto.graphStart,
                end: adminHomeDto.graphEnd,
                interval: adminHomeDto.interval,
            }),
            this.collegesService.getColleges({
                keyword: '',
                page: 1,
                perPage: adminHomeDto.perPage,
                sortBy: 'partner',
                sortOrder: '1',
            }),
        ]);
        return ResponseHandler_1.default.success({
            stats: Object.assign({ totalColleges, newColleges }, revenueStats),
            growth: growth.data,
            partners: { partners: partners.data.colleges, rows: partners.data.rows },
        });
    }
    async GetCollegesStatistics(statsDto) {
        const [revenueStats, { data: totalColleges }, { data: newColleges }] = await Promise.all([
            this.collegesService.getCollegesRevenue(statsDto),
            this.collegesService.getCollegesCount({}),
            this.collegesService.getCollegesCount(statsDto),
        ]);
        const stats = Object.assign(Object.assign({}, revenueStats), { newColleges,
            totalColleges });
        return ResponseHandler_1.default.success(stats);
    }
    async GetCollegeDetailsById(collegeIdDto, user) {
        return await this.collegesService.getCollegeById(collegeIdDto.collegeId);
    }
    async GetCollegeDetails(collegeIdDto, user) {
        const { data: { totalRevenue, collegeRevenue, unmudlShare }, } = await this.enrollmentsService.getRevenueAnalytics({ collegeId: collegeIdDto.collegeId });
        const { data: college } = await this.collegesService.getCollegeDetails(collegeIdDto);
        college.collegeEarnings = collegeRevenue;
        college.totalEarnings = collegeRevenue;
        college.sharedEarnings = unmudlShare;
        return ResponseHandler_1.default.success(college);
    }
    async GetCollegesAsCsv(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        const response = await this.collegesService.getCollegesAsCsv(listDto);
        const fields = ['Partner Name', 'Total Courses Uploaded', 'Total Earnings', 'Total Earnings Shared', 'Commission Percentage'];
        return json2csv.parse(response.data, { fields });
    }
    async GetTopColleges(durationDto, user) {
        durationDto.page = durationDto.page ? durationDto.page : 1;
        durationDto.perPage = durationDto.perPage ? durationDto.perPage : 10;
        return await this.collegesService.getTopColleges(durationDto);
    }
    async GetCollegesCount(getCountDto) {
        const newColleges = await this.collegesService.getCollegesCount(getCountDto);
        const totalColleges = await this.collegesService.getCollegesCount({});
        return ResponseHandler_1.default.success({
            newCount: newColleges.data,
            totalCount: totalColleges.data,
        });
    }
    async connectStripeAccount(authToken, user) {
        return await this.stripeService.connectStripeAccount(user, authToken);
    }
    async GetCollegeGrowthGraph(analyticsCountDto, user) {
        analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;
        return await this.collegesService.getCollegeGrowth(analyticsCountDto);
    }
    async GetCollegeGrowthGraphAsCsv(analyticsCountDto, user) {
        analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;
        const response = await this.collegesService.getCollegeGrowth(analyticsCountDto, true);
        const fields = ['Joined On', 'New Users Registered'];
        return json2csv.parse(response.data, { fields });
    }
    async GetFinanceSummary(user, collegeId) {
        collegeId = user.collegeId ? user.collegeId : collegeId ? collegeId : '';
        const { data: { totalRevenue, collegeRevenue, unmudlShare }, } = await this.enrollmentsService.getRevenueAnalytics({ collegeId });
        const { data: { pendingPayments }, } = await this.collegesService.getFinanceSummary(collegeId);
        if (collegeId) {
            const college = await this.collegesService.getCollegeById(collegeId);
            const accountBalance = await this.stripeService.getConnectAccountBalance(college.data.stripeId);
            const earningsAvailable = accountBalance.data.available && accountBalance.data.available.length > 0 && accountBalance.data.available[0].amount;
            const lastTransactionDate = await this.payoutService.getLastTransactionDate(collegeId);
            const refundChargeback = college.data.payableToUnmudl ? college.data.payableToUnmudl : 0;
            return ResponseHandler_1.default.success({
                totalRevenue,
                collegeRevenue,
                unmudlShare,
                pendingPayments,
                earningsAvailable,
                refundChargeback,
                lastTransactionDate: lastTransactionDate.data,
            });
        }
        else {
            return ResponseHandler_1.default.success({
                totalRevenue,
                collegeRevenue,
                unmudlShare,
                pendingPayments,
            });
        }
    }
    async GetFinanceSummaryDashboard(financeSummaryDto, user) {
        const { stripeAuthCode } = financeSummaryDto;
        const collegeId = user.collegeId ? user.collegeId : financeSummaryDto.collegeId ? financeSummaryDto.collegeId : '';
        if (stripeAuthCode && stripeAuthCode !== 'null' && collegeId) {
            const college = await this.collegesService.getCollegeById(collegeId);
            if (!college.data.stripeId) {
                await this.stripeService.connectStripeAccount(user, stripeAuthCode);
            }
        }
        const { data: { totalRevenue, collegeRevenue, unmudlShare }, } = await this.enrollmentsService.getRevenueAnalytics({ collegeId });
        const { data: { pendingPayments }, } = await this.collegesService.getFinanceSummary(collegeId);
        const graphRevenue = await this.collegesService.getCollegeRevenueGraph({
            collegeId,
            start: financeSummaryDto.graphStart,
            end: financeSummaryDto.graphEnd,
            interval: 1,
        });
        const recentActivities = await this.collegesService.getTransactionActivities({
            collegeId,
            keyword: '',
            start: financeSummaryDto.activitiesStart,
            end: financeSummaryDto.activitiesEnd,
            page: 1,
            perPage: Infinity,
        });
        if (collegeId) {
            const college = await this.collegesService.getCollegeById(collegeId);
            const accountBalance = college.data.stripeId ? await this.stripeService.getConnectAccountBalance(college.data.stripeId) : null;
            const refundChargeback = college.data.payableToUnmudl ? college.data.payableToUnmudl : 0;
            const earningsAvailable = accountBalance &&
                accountBalance.data.available &&
                accountBalance.data.available.length > 0 &&
                accountBalance.data.available[0].amount;
            const lastTransactionDate = await this.payoutService.getLastTransactionDate(collegeId);
            const account = college.data.stripeId ? await this.stripeService.getStripeAccountDetails(college.data.stripeId) : null;
            const accountDetails = {
                title: account ? college.data.title : '',
                coverPhoto: account ? college.data.collegeLogo : '',
                balance: account ? earningsAvailable : 0,
            };
            return ResponseHandler_1.default.success({
                summary: {
                    totalRevenue,
                    collegeRevenue,
                    refundChargeback,
                    sharedRevenue: unmudlShare,
                    pendingPayments,
                    earningsAvailable,
                    lastTransactionDate: lastTransactionDate.data,
                },
                graph: graphRevenue.data,
                stripeAccount: accountDetails,
                recentActivities: recentActivities.data,
            });
        }
        else {
            return ResponseHandler_1.default.success({
                summary: {
                    totalRevenue,
                    collegeRevenue,
                    sharedRevenue: unmudlShare,
                    pendingPayments,
                },
                graph: graphRevenue.data,
                recentActivities: recentActivities.data,
            });
        }
    }
    async GetTransactionHistoryForFinanceSummarySection(user, recentActivityDto) {
        const collegeId = user.collegeId ? user.collegeId : recentActivityDto.collegeId ? recentActivityDto.collegeId : '';
        return await this.collegesService.getTransactionActivities({
            collegeId,
            keyword: recentActivityDto.keyword ? recentActivityDto.keyword : '',
            start: recentActivityDto.start,
            end: recentActivityDto.end,
            page: 1,
            perPage: Infinity,
        });
    }
    async GetTransactionHistoryAsCsvForFinanceSummarySection(user, transactionActivityCsvDto) {
        const collegeId = user.collegeId ? user.collegeId : transactionActivityCsvDto.collegeId ? transactionActivityCsvDto.collegeId : '';
        return await this.collegesService.getTransactionActivitiesCsv({
            collegeId,
            start: transactionActivityCsvDto.start,
            end: transactionActivityCsvDto.end,
        });
    }
    async GetFinanceRevenueGraph(user, params) {
        params.collegeId = user.collegeId ? user.collegeId : params.collegeId ? params.collegeId : '';
        const graphRevenue = await this.collegesService.getCollegeRevenueGraph(params);
        return ResponseHandler_1.default.success(graphRevenue.data);
    }
    async GetFinanceRevenueGraphCsv(user, params) {
        params.collegeId = user.collegeId ? user.collegeId : params.collegeId ? params.collegeId : '';
        return await this.collegesService.getCollegeRevenueGraphAsCsv(params);
    }
    async SuspendUnsuspendCollege(collegeIdDto, user) {
        return await this.collegesService.suspendUnsupendCollege(collegeIdDto.collegeId);
    }
    async getUnmudlAdminCollegePortalAccessToken(collegeIdDto, user) {
        if (user.type !== 'user' || user.collegeId) {
            return ResponseHandler_1.default.fail('Only Unmudl superadmin can access this route.');
        }
        return await this.collegesService.getUnmudlAdminCollegePortalAccessToken(collegeIdDto.collegeId, user);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Verify token and return college.' }),
    common_1.Get('bytoken'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_dto_1.TokenDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegeByToken", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'College Signup: All data from the four steps of sign-up will be sent to create a new college account.' }),
    common_1.Post('create'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'collegeLogo', maxCount: 1 },
        { name: 'collegeBanner', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                if (file.fieldname === 'profilePhoto') {
                    cb(null, './public' + config_1.USERS_IMG_PATH);
                }
                else if (file.fieldname === 'collegeLogo') {
                    cb(null, './public' + config_1.COLLEGES_IMG_PATH);
                }
                else if (file.fieldname === 'collegeBanner') {
                    cb(null, './public' + config_1.COLLEGES_IMG_PATH);
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
    __metadata("design:paramtypes", [signUpCollege_dto_1.SignUpCollegeDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "create", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'College update.' }),
    common_1.Post('update-college/:collegeId'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'collegeLogo', maxCount: 1 },
        { name: 'collegeBanner', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public' + config_1.COLLEGES_IMG_PATH);
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()),
    __param(1, common_1.Body()),
    __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto,
        updateCollege_dto_1.UpdateCollegeDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "Update", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Update commission of a partner.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.Post('/update-partner-commission/:collegeId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePartnerCommission_dto_1.UpdatePartnerCommissionDto, collegeId_dto_1.CollegeIdDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "updatePartnerCommission", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Change the group a partner belongs to.' }),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.Post('/update-partner-group/:collegeId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto, partnerGroupId_dto_1.PartnerGroupIdDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "updatePartnerGroup", null);
__decorate([
    common_1.Post('check-email'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body('emailAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "checkIfEmailExists", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get colleges by location.' }),
    common_1.Get('by-location'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_dto_1.LocationDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "getCollegesByLocation", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get colleges by location.' }),
    common_1.Get('/employer-portal/by-location'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_dto_1.LocationDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "getCollegesByLocationForEmployerPortal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get colleges list for employers portal.' }),
    common_1.Get('employer-portal'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "getCollegesForEmployerPortal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: `Get user's college.` }),
    common_1.Get('profile'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalCollegeId_dto_1.OptionalCollegeIdDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetUsersCollege", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: `Get user's college's recent activity.` }),
    common_1.Get('/profile/recent-activity'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recentActivity_dto_1.RecentActivityDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegeRecentActivity", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Update college profile.' }),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'collegeLogo', maxCount: 1 },
        { name: 'collegeBanner', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/colleges-images/');
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
    __param(0, common_1.Body()),
    __param(1, get_user_decorator_1.GetUser()),
    __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateCollege_dto_1.UpdateCollegeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "UpdateCollegeProfile", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of registered colleges.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegesList_dto_1.CollegesListDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetColleges", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of colleges names.' }),
    common_1.Get('names'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegeNamesList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of colleges names.' }),
    common_1.Get('/employer-portal/names'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "getCollegeNamesListForEmployerPortal", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of registered colleges.' }),
    common_1.Get('dropdown'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegesDropdown", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get partner dashboard data.' }),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adminHomeDto_dto_1.default, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegeDashboard", null);
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
], CollegesController.prototype, "GetCollegesStatistics", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Get college details by id.' }),
    common_1.Get('/detail-by-id/:collegeId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegeDetailsById", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get college details by id.' }),
    common_1.Get('/details/:collegeId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegeDetails", null);
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
], CollegesController.prototype, "GetCollegesAsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get a paginated list of top registered colleges for admin dashboard.' }),
    common_1.Get('/analytics'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optionalDurationPagination_dto_1.OptionalDurationPaginationDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetTopColleges", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get count of registered colleges for admin analytics.' }),
    common_1.Get('/analytics/count'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getCount_dto_1.GetCountDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetCollegesCount", null);
__decorate([
    common_1.Post('connect-account'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body('stripeToken')), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "connectStripeAccount", null);
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
], CollegesController.prototype, "GetCollegeGrowthGraph", null);
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
], CollegesController.prototype, "GetCollegeGrowthGraphAsCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get total revenue, shared revenue, pending payments, earnings available and last transaction date.' }),
    common_1.Get('/finance-summary'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Query('collegeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetFinanceSummary", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get finance summary dashboard.' }),
    common_1.Get('/finance-summary/admin-home'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [financeSummary_dto_1.FinanceSummaryDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetFinanceSummaryDashboard", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get finance summary dashboard.' }),
    common_1.Get('/finance-summary/transaction-history'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()),
    __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recentActivity_dto_1.RecentActivityDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetTransactionHistoryForFinanceSummarySection", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get finance section transaction history csv.' }),
    common_1.Get('/finance-summary/transaction-history/csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=transaction history.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()),
    __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transactionActivityCsv_dto_1.TransactionActivityCsvDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetTransactionHistoryAsCsvForFinanceSummarySection", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get revenue graph data on finance summary section.' }),
    common_1.Get('/finance-summary/graph'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, interval_dto_1.IntervalDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetFinanceRevenueGraph", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    swagger_1.ApiOperation({ summary: 'Get revenue graph data on finance summary section.' }),
    common_1.Get('/finance-summary/graph/csv'),
    common_1.Header('Content-type', 'text/csv'),
    common_1.Header('Content-disposition', 'attachment; filename=Revenue Growth.csv'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, interval_dto_1.IntervalDto]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "GetFinanceRevenueGraphCsv", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    swagger_1.ApiOperation({ summary: 'Suspend partner account.' }),
    common_1.Post('/suspend-unsuspend'),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "SuspendUnsuspendCollege", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('superadmin'),
    swagger_1.ApiOperation({ summary: 'Get unmudl admin access to college portal.' }),
    common_1.Post('/unmudl-admin/access'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [collegeId_dto_1.CollegeIdDto, Object]),
    __metadata("design:returntype", Promise)
], CollegesController.prototype, "getUnmudlAdminCollegePortalAccessToken", null);
CollegesController = __decorate([
    swagger_1.ApiTags('College'),
    common_1.Controller('colleges'),
    __metadata("design:paramtypes", [colleges_service_1.CollegesService,
        college_invitations_service_1.CollegeInvitationsService,
        users_service_1.UsersService,
        stripe_service_1.StripeService,
        payouts_service_1.PayoutsService,
        activities_service_1.ActivitiesService,
        notifications_service_1.NotificationsService,
        enrollments_service_1.EnrollmentsService])
], CollegesController);
exports.CollegesController = CollegesController;
//# sourceMappingURL=colleges.controller.js.map