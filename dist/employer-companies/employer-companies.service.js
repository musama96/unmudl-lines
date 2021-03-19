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
const mongoose_1 = require("@nestjs/mongoose");
const ResponseHandler_1 = require("../common/ResponseHandler");
const responseMessages_1 = require("../config/responseMessages");
const jwt_1 = require("@nestjs/jwt");
const colleges_service_1 = require("../colleges/colleges.service");
const employers_service_1 = require("../employers/employers.service");
const functions_1 = require("../common/functions");
const unmudl_access_logs_service_1 = require("../unmudl-access-logs/unmudl-access-logs.service");
const s3_1 = require("../s3upload/s3");
let EmployerCompaniesService = class EmployerCompaniesService {
    constructor(employerCompanyModel, employerCompanyTokenModel, employerInvitationModel, employerAdminModel, jwtService, collegesService, employersService, unmudlAccessLogsService) {
        this.employerCompanyModel = employerCompanyModel;
        this.employerCompanyTokenModel = employerCompanyTokenModel;
        this.employerInvitationModel = employerInvitationModel;
        this.employerAdminModel = employerAdminModel;
        this.jwtService = jwtService;
        this.collegesService = collegesService;
        this.employersService = employersService;
        this.unmudlAccessLogsService = unmudlAccessLogsService;
    }
    async getEmployerById(employerId, lean = true) {
        let employer = this.employerCompanyModel.findById(employerId).populate('industries');
        if (lean) {
            employer = await employer.lean();
        }
        else {
            employer = await employer.exec();
        }
        return ResponseHandler_1.default.success(employer);
    }
    async updateEmployer(employerCompany) {
        let existingEmployer;
        if (employerCompany.employerLogo || employerCompany.employerBanner) {
            existingEmployer = await this.employerCompanyModel
                .findById(employerCompany._id, 'employerLogo employerLogoThumbnail employerBanner')
                .lean()
                .exec();
            const files = [];
            existingEmployer.employerLogo && existingEmployer.employerLogo !== employerCompany.employerLogo
                ? files.push(existingEmployer.employerLogo)
                : null;
            existingEmployer.employerLogoThumbnail && existingEmployer.employerLogoThumbnail !== employerCompany.employerLogoThumbnail
                ? files.push(existingEmployer.employerLogoThumbnail)
                : null;
            existingEmployer.employerBanner && existingEmployer.employerBanner !== employerCompany.employerBanner
                ? files.push(existingEmployer.employerBanner)
                : null;
            files.length > 0 ? await s3_1.removeFilesFromS3(files) : null;
        }
        await this.employerCompanyModel
            .findByIdAndUpdate(employerCompany._id, {
            $set: employerCompany,
        })
            .exec();
        const newEmployerCompany = await this.employerCompanyModel
            .findById(employerCompany._id)
            .populate('industries')
            .lean();
        return ResponseHandler_1.default.success(newEmployerCompany, responseMessages_1.default.success.updateEmployerCompany);
    }
    async toggleSuspendEmployer(employerId) {
        const employer = await this.employerCompanyModel.findById(employerId).exec();
        employer.isSuspended = !employer.isSuspended;
        await employer.save();
        return ResponseHandler_1.default.success({}, `Employer ${employer.isSuspended ? 'suspended' : 'unsuspended'} successfully.`);
    }
    async verifyToken(token, remove = false) {
        const tokenData = await this.employerCompanyTokenModel.aggregate([
            { $match: { token } },
            {
                $lookup: {
                    from: 'employer-companies',
                    localField: 'employer',
                    foreignField: '_id',
                    as: 'employer',
                },
            },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'employer-invitations',
                    localField: 'employer._id',
                    foreignField: 'employerId',
                    as: 'employerInvitation',
                },
            },
            { $match: { 'employerInvitation.isSuspended': { $ne: true } } },
            { $unset: 'employerInvitation' },
            { $unwind: { path: '$employerInvitation', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'employer._id',
                    foreignField: 'employerId',
                    as: 'admin',
                },
            },
            { $unwind: { path: '$admin', preserveNullAndEmptyArrays: true } },
            { $match: { 'admin.role': 'superadmin' } },
            { $limit: 1 },
        ]);
        if (remove) {
            await this.employerCompanyTokenModel.deleteOne({ token }).exec();
        }
        return tokenData[0] ? tokenData[0] : null;
    }
    async getEmployersList(params) {
        const { keyword, page, perPage, collegeId } = params;
        const [employersList, { collegesCount, coursesCount, employersCount }] = await Promise.all([
            this.employersService.getEmployersForFilter({ keyword, collegeId }),
            this.collegesService.getCollegeStats(collegeId),
        ]);
        return ResponseHandler_1.default.success({ employersList, collegesCount, coursesCount, employersCount });
    }
    async getEmployersCount(params) {
        const { start, end } = params;
        const find = {};
        if (start || end) {
            const createdAt = {};
            if (start) {
                createdAt.$gte = start;
            }
            if (end) {
                createdAt.$lte = end;
            }
            find.createdAt = createdAt;
        }
        const count = await this.employerCompanyModel.countDocuments(find).exec();
        return ResponseHandler_1.default.success(count);
    }
    async getEmployerGrowth(params, csv = false) {
        const { interval, start, end } = params;
        const match = {};
        if (start || end) {
            match.createdAt = {};
            if (start) {
                match.createdAt.$gte = new Date(start);
            }
            if (end) {
                match.createdAt.$lte = new Date(end);
            }
        }
        const pipeline = [];
        pipeline.push({
            $match: match,
        });
        switch (interval) {
            case 1:
                pipeline.push({
                    $addFields: {
                        day: {
                            $dayOfYear: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            day: '$day',
                            year: '$year',
                        },
                        createdAt: { $first: '$createdAt' },
                        count: { $sum: 1 },
                    },
                });
                break;
            case 30:
                pipeline.push({
                    $addFields: {
                        month: {
                            $month: '$createdAt',
                        },
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            month: '$month',
                            year: '$year',
                        },
                        createdAt: { $first: '$createdAt' },
                        count: { $sum: 1 },
                    },
                });
                break;
            case 365:
                pipeline.push({
                    $addFields: {
                        year: {
                            $year: '$createdAt',
                        },
                    },
                });
                pipeline.push({
                    $group: {
                        _id: {
                            year: '$year',
                        },
                        createdAt: { $first: '$createdAt' },
                        count: { $sum: 1 },
                    },
                });
                break;
        }
        pipeline.push({
            $unset: '_id',
        });
        if (csv) {
            pipeline.push({
                $project: {
                    'Joined On': {
                        $dateToString: { format: '%m-%d-%Y', date: '$createdAt' },
                    },
                    'New Users Registered': '$count',
                    createdAt: '$createdAt',
                },
            });
        }
        const employers = await this.employerCompanyModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(employers);
    }
    async getEmployers(params) {
        const { keyword, page, perPage, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [
            {
                $match: {
                    title: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
            },
            {
                $lookup: {
                    from: 'employer-groups',
                    localField: 'employerGroup',
                    foreignField: '_id',
                    as: 'group',
                },
            },
            {
                $unwind: {
                    path: '$group',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'employer-invitations',
                    localField: '_id',
                    foreignField: 'employerId',
                    as: 'invitation',
                },
            },
            {
                $unwind: {
                    path: '$invitation',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'employer-industries',
                    localField: 'industries',
                    foreignField: '_id',
                    as: 'industries',
                },
            },
            {
                $group: {
                    _id: '$_id',
                    employer: { $first: '$title' },
                    employerLogo: { $first: '$employerLogo' },
                    employerLogoThumbnail: { $first: '$employerLogoThumbnail' },
                    employerBanner: { $first: '$employerBanner' },
                    contact: { $first: '$contact' },
                    address: { $first: '$address' },
                    city: { $first: '$city' },
                    state: { $first: '$state' },
                    size: { $first: '$size' },
                    group: { $first: '$group' },
                    date_accepted: { $first: '$invitation.date_accepted' },
                    isSuspended: { $first: '$isSuspended' },
                    industries: { $first: '$industries' },
                },
            },
            {
                $sort: sort,
            },
        ];
        const [employers, rows] = await Promise.all([
            this.employerCompanyModel
                .aggregate(pipeline)
                .collation({ locale: 'en', strength: 2 })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec(),
            this.employerCompanyModel.countDocuments({
                title: {
                    $regex: keyword,
                    $options: 'i',
                },
            }),
        ]);
        return ResponseHandler_1.default.success({ employers, rows });
    }
    async getEmployersAsCsv(params) {
        const { keyword, page, perPage, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [
            {
                $match: {
                    title: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
            },
            {
                $lookup: {
                    from: 'employer-groups',
                    localField: 'employerGroup',
                    foreignField: '_id',
                    as: 'group',
                },
            },
            {
                $unwind: {
                    path: '$group',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'employer-invitations',
                    localField: '_id',
                    foreignField: 'employerId',
                    as: 'invitation',
                },
            },
            {
                $unwind: {
                    path: '$invitation',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    'Employer Name': { $first: '$title' },
                    Location: { $first: '$address' },
                    'NAICS Code': { $first: '$code' },
                    'Employees Size': { $first: '$size' },
                    'Date of joining': { $first: '$invitation.date_accepted' },
                },
            },
            {
                $sort: sort,
            },
        ];
        const employers = await this.employerCompanyModel
            .aggregate(pipeline)
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        return ResponseHandler_1.default.success(employers);
    }
    async returnUnmudlAdminEmployerPortalAccess(employerId, user) {
        const employer = await this.employerCompanyModel.findById(employerId).lean();
        if (!employer) {
            return ResponseHandler_1.default.fail('Employer not found.');
        }
        let sysAdmin = await this.employerAdminModel.findOne({ employerId, role: 'system' }).lean();
        if (!sysAdmin) {
            const newAdmin = {
                fullname: `Unmudl Admin for ${functions_1.default.getInitialsOfWords(employer.title)}`,
                emailAddress: `${employerId}@unmudl.com`,
                password: '',
                role: 'system',
                employerId,
                lastLoggedIn: new Date(),
                designation: '',
                profilePhoto: '',
                profilePhotoThumbnail: '',
                joinDate: new Date(),
                invitation: 'accepted',
                isSuspended: false,
                notifications: {
                    email: false,
                    proposal: false,
                    chat: false,
                    newNotification: false,
                },
                archivedChats: [],
            };
            sysAdmin = await this.employerAdminModel.create(newAdmin);
        }
        this.unmudlAccessLogsService.createLog({
            type: 'employer',
            user: user._id,
            employer: employerId,
        });
        const payload = { _id: sysAdmin._id, emailAddress: sysAdmin.emailAddress, type: 'employer' };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                _id: sysAdmin._id,
                fullname: sysAdmin.fullname,
                username: sysAdmin.username,
                emailAddress: sysAdmin.emailAddress,
                profilePhoto: '',
                profilePhotoThumbnail: '',
                employerId,
                employer: employer.title,
                employerDomain: employer.domain,
                employerLogo: employer.employerLogo,
                employerLogoThumbnail: employer.employerLogoThumbnail,
                role: sysAdmin.role,
                admin: {
                    fullname: user.fullname,
                    profilePhoto: user.profilePhoto,
                    profilePhotoThumbnail: user.profilePhotoThumbnail,
                },
                activeSubscription: null,
            },
        };
    }
};
EmployerCompaniesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-companies')),
    __param(1, mongoose_1.InjectModel('employer-company-tokens')),
    __param(2, mongoose_1.InjectModel('employer-invitations')),
    __param(3, mongoose_1.InjectModel('employer-admins')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, jwt_1.JwtService,
        colleges_service_1.CollegesService,
        employers_service_1.EmployersService,
        unmudl_access_logs_service_1.UnmudlAccessLogsService])
], EmployerCompaniesService);
exports.EmployerCompaniesService = EmployerCompaniesService;
//# sourceMappingURL=employer-companies.service.js.map