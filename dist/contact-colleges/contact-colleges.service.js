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
const mongoose = require("mongoose");
const notifications_service_1 = require("../notifications/notifications.service");
const colleges_service_1 = require("../colleges/colleges.service");
const users_service_1 = require("../users/users.service");
const mailer_1 = require("@nest-modules/mailer");
const moment = require("moment");
let ContactCollegesService = class ContactCollegesService {
    constructor(employerModel, contactCollegeProposalModel, contactCollegeDraftProposalModel, notificationsService, collegesService, usersService, mailerService) {
        this.employerModel = employerModel;
        this.contactCollegeProposalModel = contactCollegeProposalModel;
        this.contactCollegeDraftProposalModel = contactCollegeDraftProposalModel;
        this.notificationsService = notificationsService;
        this.collegesService = collegesService;
        this.usersService = usersService;
        this.mailerService = mailerService;
    }
    async getProposalsForEmployer(params, user) {
        const { keyword, sortBy, sortOrder, page, perPage, employerId, employerAdminId, status, category, subCategory } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            title: {
                $regex: keyword,
                $options: 'i',
            },
            employer: employerId,
            deletedAt: null,
        };
        if (user.role !== 'system') {
            match.$or = [
                { showToEmployerAdmins: mongoose.Types.ObjectId(employerAdminId) },
                { addedBy: mongoose.Types.ObjectId(employerAdminId) },
            ];
        }
        if (status) {
            match.status = status === 'active' ? { $ne: 'closed' } : 'closed';
        }
        if (category) {
            match.category = mongoose.Types.ObjectId(category);
        }
        if (subCategory) {
            match.subCategory = mongoose.Types.ObjectId(subCategory);
        }
        const proposals = await this.contactCollegeProposalModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            { $skip: (page - 1) * perPage },
            { $limit: perPage },
            {
                $lookup: {
                    from: 'contact-college-categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'addedBy',
                    foreignField: '_id',
                    as: 'addedBy',
                },
            },
            { $unwind: '$addedBy' },
            {
                $lookup: {
                    from: 'contact-college-responses',
                    let: { proposalId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$$proposalId', '$proposal'] },
                            },
                        },
                        {
                            $lookup: {
                                from: 'chats',
                                localField: 'chat',
                                foreignField: '_id',
                                as: 'chat',
                            },
                        },
                        {
                            $unwind: {
                                path: '$chat',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $addFields: {
                                readByEmployerAdmins: {
                                    $cond: {
                                        if: '$chat.readByEmployerAdmins',
                                        then: '$chat.readByEmployerAdmins',
                                        else: [],
                                    },
                                },
                            },
                        },
                        {
                            $addFields: {
                                isRead: {
                                    $cond: {
                                        if: { $in: [mongoose.Types.ObjectId(employerAdminId), '$readByEmployerAdmins'] },
                                        then: true,
                                        else: false,
                                    },
                                },
                            },
                        },
                    ],
                    as: 'responses',
                },
            },
            {
                $addFields: {
                    newResponses: {
                        $filter: {
                            input: '$responses',
                            as: 'response',
                            cond: { $eq: ['$$response.isRead', false] },
                        },
                    },
                },
            },
            {
                $addFields: {
                    responsesCount: { $size: '$responses' },
                    newResponsesCount: { $size: '$newResponses' },
                },
            },
            { $unset: ['responses', 'newResponses'] },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const rows = await this.contactCollegeProposalModel.countDocuments(match).exec();
        return ResponseHandler_1.default.success({ proposals, rows });
    }
    async getProposalDetailsForEmployer(proposalId) {
        const proposal = await this.contactCollegeProposalModel
            .findOne({
            _id: proposalId,
            deletedAt: null,
        })
            .populate('category')
            .populate('colleges', 'title collegeLogo collegeBanner collegeLogoThumbnail')
            .populate('showToEmployerAdmins', 'fullname emailAddress designation profilePhoto profilePhotoThumbnail')
            .lean();
        if (proposal && proposal.visibility === 'all') {
            const { data: colleges } = await this.collegesService.getAllColleges();
            proposal.colleges = colleges;
        }
        return ResponseHandler_1.default.success(proposal, !proposal ? 'This proposal has been deleted.' : '');
    }
    async getProposalsForCollege(params) {
        const { keyword, sortBy, sortOrder, page, perPage, collegeId, userId } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const proposals = await this.contactCollegeProposalModel
            .aggregate([
            {
                $match: {
                    title: {
                        $regex: keyword,
                        $options: 'i',
                    },
                    $or: [{ colleges: mongoose.Types.ObjectId(collegeId) }, { visibility: 'all' }],
                    status: { $in: [null, 'active'] },
                    deletedAt: null,
                },
            },
            { $sort: sort },
            { $skip: (page - 1) * perPage },
            { $limit: perPage },
            {
                $lookup: {
                    from: 'contact-college-categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'addedBy',
                    foreignField: '_id',
                    as: 'addedBy',
                },
            },
            {
                $lookup: {
                    from: 'employer-companies',
                    localField: 'employer',
                    foreignField: '_id',
                    as: 'employer',
                },
            },
            {
                $lookup: {
                    from: 'contact-college-responses',
                    let: { proposalId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $and: [{ $eq: ['$$proposalId', '$proposal'] }, { $eq: ['$college', mongoose.Types.ObjectId(collegeId)] }] },
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: { userId: '$appliedBy' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$$userId', '$_id'] },
                                        },
                                    },
                                    {
                                        $project: {
                                            fullname: 1,
                                            emailAddress: 1,
                                            designation: 1,
                                            profilePhoto: 1,
                                            profilePhotoThumbnail: 1,
                                        },
                                    },
                                ],
                                as: 'appliedBy',
                            },
                        },
                        {
                            $unwind: {
                                path: '$appliedBy',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'response',
                },
            },
            { $unwind: { path: '$response', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$addedBy', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    responseUsers: { $cond: { if: '$response', then: '$response.users', else: [] } },
                },
            },
            {
                $addFields: {
                    canViewConversation: {
                        $cond: [{ $in: [mongoose.Types.ObjectId(userId), '$responseUsers'] }, true, false],
                    },
                },
            },
            { $unset: ['responseUsers'] },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const rows = await this.contactCollegeProposalModel
            .countDocuments({
            title: {
                $regex: keyword,
                $options: 'i',
            },
            $or: [{ colleges: collegeId }, { visibility: 'all' }],
            status: { $in: [null, 'active'] },
            deletedAt: null,
        })
            .exec();
        return ResponseHandler_1.default.success({ proposals, rows });
    }
    async getProposalDetailsForCollege(proposalId) {
        const proposal = await this.contactCollegeProposalModel
            .findOne({
            _id: proposalId,
            deletedAt: null,
        })
            .populate('addedBy')
            .populate('employer')
            .populate('category')
            .populate('showToEmployerAdmins', 'fullname emailAddress designation profilePhoto profilePhotoThumbnail')
            .populate('colleges', 'title')
            .lean();
        if (proposal && proposal.visibility === 'all') {
            const { data: colleges } = await this.collegesService.getAllColleges();
            proposal.colleges = colleges;
        }
        return ResponseHandler_1.default.success(proposal, !proposal ? 'This proposal has been deleted.' : '');
    }
    async getActiveProposalsCount(employerId) {
        const proposals = await this.contactCollegeProposalModel.countDocuments({ employer: employerId }).lean();
        return ResponseHandler_1.default.success(proposals);
    }
    async createProposal(proposal, user) {
        if (proposal.draftProposalId) {
            await this.contactCollegeDraftProposalModel.deleteOne({ _id: mongoose.Types.ObjectId(proposal.draftProposalId) });
        }
        let newProposal = new this.contactCollegeProposalModel(proposal);
        newProposal = await newProposal.save();
        this.notificationsService.newProposal(newProposal);
        const { data: unmudlAdmins } = await this.usersService.getUnmudlAdminsForEmail();
        newProposal = await newProposal.populate('category').execPopulate();
        const subCategory = newProposal.category.subcategories.find(subcategory => newProposal.subCategory.toString() === subcategory._id.toString());
        if (proposal.visibility === 'all') {
            proposal.colleges = await this.collegesService.getAllCollegesIds();
        }
        proposal.colleges.forEach(async (collegeId) => {
            const { data: college } = await this.collegesService.getCollegeById(collegeId);
            const { data: collegeSuperAdmins } = await this.usersService.getCollegeSuperAdmins(collegeId);
            const employer = await this.employerModel.findById(user.employerId);
            const emailRecipients = [...unmudlAdmins, ...collegeSuperAdmins];
            for (let i = 0; i < emailRecipients.length; i++) {
                setTimeout(async () => {
                    try {
                        await this.mailerService.sendMail({
                            to: emailRecipients[i].emailAddress,
                            from: emailRecipients[i].collegeId ? process.env.PARTNER_NOTIFICATION_FROM : process.env.ADMIN_NOTIFICATION_FROM,
                            subject: `An employer is attempting to contact ${college.title} with a request`,
                            template: 'adminContactColleges',
                            context: {
                                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                                date: moment(new Date()).format('LL'),
                                employer: employer.title,
                                college: college.title,
                                request: {
                                    title: proposal.title,
                                    description: proposal.description,
                                    category: newProposal.category.title,
                                    subCategory: subCategory.title,
                                },
                            },
                        });
                    }
                    catch (err) { }
                }, 1000);
            }
        });
        return ResponseHandler_1.default.success(newProposal, 'Contact college proposal submitted successfully.');
    }
    async updateProposal(id, proposal) {
        const newProposal = await this.contactCollegeProposalModel
            .findByIdAndUpdate(id, {
            $set: proposal,
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(newProposal, 'Proposal updated successfully.');
    }
    async disableProposal(id) {
        const disabledProposal = await this.contactCollegeProposalModel
            .findByIdAndUpdate(id, {
            $set: {
                deletedAt: new Date(),
            },
        }, {
            new: true,
        })
            .exec();
        if (disabledProposal) {
            return ResponseHandler_1.default.success(disabledProposal, 'Proposal disabled successfully');
        }
        else {
            return ResponseHandler_1.default.fail('Proposal not found.');
        }
    }
    async invertProposalStatus(id) {
        const proposal = await this.contactCollegeProposalModel.findById(id).exec();
        proposal.status = proposal.status === 'closed' ? 'active' : 'closed';
        await proposal.save();
        return ResponseHandler_1.default.success(proposal, 'Proposal status updated successfully.');
    }
    async getDraftProposals(params, user) {
        const { keyword, sortBy, sortOrder, page, perPage, employerAdminId } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const find = {
            title: {
                $regex: keyword,
                $options: 'i',
            },
            deletedAt: null,
        };
        if (user.role !== 'system') {
            find.$or = [
                { showToEmployerAdmins: mongoose.Types.ObjectId(employerAdminId) },
                { addedBy: mongoose.Types.ObjectId(employerAdminId) },
            ];
        }
        const draftProposals = await this.contactCollegeDraftProposalModel
            .find(find)
            .sort(sort)
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('category')
            .populate('addedBy')
            .populate('colleges', 'title')
            .exec();
        const rows = await this.contactCollegeDraftProposalModel
            .countDocuments({
            title: {
                $regex: keyword,
                $options: 'i',
            },
            $or: [{ showToEmployerAdmins: mongoose.Types.ObjectId(employerAdminId) }, { addedBy: mongoose.Types.ObjectId(employerAdminId) }],
            deletedAt: null,
        })
            .exec();
        return ResponseHandler_1.default.success({ draftProposals, rows });
    }
    async getDraftProposalDetails(proposalId) {
        const draftProposal = await this.contactCollegeDraftProposalModel
            .findOne({
            _id: proposalId,
            deletedAt: null,
        })
            .populate('category')
            .populate('colleges', 'title')
            .lean();
        return ResponseHandler_1.default.success(draftProposal);
    }
    async createDraftProposal(draftProposal) {
        if (draftProposal.proposalId) {
            await this.contactCollegeProposalModel.deleteOne({ _id: mongoose.Types.ObjectId(draftProposal.proposalId) });
        }
        let newDraftProposal = new this.contactCollegeDraftProposalModel(draftProposal);
        newDraftProposal = await newDraftProposal.save();
        return ResponseHandler_1.default.success(newDraftProposal, 'Contact college proposal draft submitted successfully.');
    }
    async updateDraftProposal(id, draftProposal) {
        const newDraftProposal = await this.contactCollegeDraftProposalModel
            .findByIdAndUpdate(id, {
            $set: draftProposal,
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(newDraftProposal, 'Proposal draft updated successfully.');
    }
    async disableDraftProposal(id) {
        const disabledProposal = await this.contactCollegeDraftProposalModel
            .findByIdAndUpdate(id, {
            $set: {
                deletedAt: new Date(),
            },
        }, {
            new: true,
        })
            .exec();
        if (disabledProposal) {
            return ResponseHandler_1.default.success(disabledProposal, 'Proposal draft disabled successfully');
        }
        else {
            return ResponseHandler_1.default.fail('Proposal draft not found.');
        }
    }
    async getProposalById(id, lean = true) {
        let proposal = this.contactCollegeProposalModel.findById(id);
        if (lean) {
            proposal = await proposal.lean();
        }
        else {
            proposal = await proposal.exec();
        }
        return ResponseHandler_1.default.success(proposal);
    }
};
ContactCollegesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-companies')),
    __param(1, mongoose_1.InjectModel('contact-college-proposals')),
    __param(2, mongoose_1.InjectModel('contact-college-draft-proposals')),
    __metadata("design:paramtypes", [Object, Object, Object, notifications_service_1.NotificationsService,
        colleges_service_1.CollegesService,
        users_service_1.UsersService,
        mailer_1.MailerService])
], ContactCollegesService);
exports.ContactCollegesService = ContactCollegesService;
//# sourceMappingURL=contact-colleges.service.js.map