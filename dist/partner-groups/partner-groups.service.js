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
const mongoose = require("mongoose");
let PartnerGroupsService = class PartnerGroupsService {
    constructor(partnerGroupModel, employerGroupModel, collegeModel, employerModel) {
        this.partnerGroupModel = partnerGroupModel;
        this.employerGroupModel = employerGroupModel;
        this.collegeModel = collegeModel;
        this.employerModel = employerModel;
    }
    async addPartnerGroup(group) {
        const [isTitlePresent, isColorPresent] = await Promise.all([
            this.getPartnerGroupByTitle(group.title),
            this.getPartnerGroupByHex(group.color),
        ]);
        if (isTitlePresent.data) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.addPartnerGroup.titlePresent, { title: responseMessages_1.default.addPartnerGroup.titlePresent });
        }
        else if (isColorPresent.data) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.addPartnerGroup.colorPresent, { color: responseMessages_1.default.addPartnerGroup.colorPresent });
        }
        else {
            let newGroup = new this.partnerGroupModel(group);
            newGroup = await newGroup.save();
            return ResponseHandler_1.default.success(newGroup);
        }
    }
    async addEmployerGroup(group) {
        const [isTitlePresent, isColorPresent] = await Promise.all([
            this.getEmployerGroupByTitle(group.title),
            this.getEmployerGroupByHex(group.color),
        ]);
        if (isTitlePresent.data) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.addPartnerGroup.titlePresent, { title: responseMessages_1.default.addPartnerGroup.titlePresent });
        }
        else if (isColorPresent.data) {
            return ResponseHandler_1.default.fail(responseMessages_1.default.addPartnerGroup.colorPresent, { color: responseMessages_1.default.addPartnerGroup.colorPresent });
        }
        else {
            let newGroup = new this.employerGroupModel(group);
            newGroup = await newGroup.save();
            return ResponseHandler_1.default.success(newGroup);
        }
    }
    async updatePartnerGroup(group) {
        const [isTitlePresent, isColorPresent] = await Promise.all([
            this.partnerGroupModel.findOne({ title: group.title, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
            this.partnerGroupModel.findOne({ color: group.color, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
        ]);
        if (isTitlePresent || isColorPresent) {
            return ResponseHandler_1.default.fail('', isTitlePresent
                ? { title: responseMessages_1.default.addPartnerGroup.titlePresent }
                : { color: responseMessages_1.default.addPartnerGroup.colorPresent });
        }
        const oldGroup = await this.partnerGroupModel.findById(group._id);
        if (oldGroup) {
            const newGroup = await this.partnerGroupModel.findByIdAndUpdate(group._id, group, { new: true }).exec();
            return ResponseHandler_1.default.success(newGroup);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.updatePartnerGroup.doesNotExist);
        }
    }
    async updateEmployerGroup(group) {
        const [isTitlePresent, isColorPresent] = await Promise.all([
            this.employerGroupModel.findOne({ title: group.title, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
            this.employerGroupModel.findOne({ color: group.color, _id: { $ne: mongoose.Types.ObjectId(group._id) } }),
        ]);
        if (isTitlePresent || isColorPresent) {
            return ResponseHandler_1.default.fail('', isTitlePresent
                ? { title: responseMessages_1.default.addPartnerGroup.titlePresent }
                : { color: responseMessages_1.default.addPartnerGroup.colorPresent });
        }
        const oldGroup = await this.employerGroupModel.findById(group._id);
        if (oldGroup) {
            const newGroup = await this.employerGroupModel.findByIdAndUpdate(group._id, group, { new: true }).exec();
            return ResponseHandler_1.default.success(newGroup);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.updatePartnerGroup.doesNotExist);
        }
    }
    async getAllPartnerGroup() {
        const groups = await this.partnerGroupModel
            .aggregate([
            {
                $lookup: {
                    from: 'colleges',
                    let: { groupId: '$_id' },
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$partnerGroup', '$$groupId'] }] } } }, { $limit: 1 }, { $project: { _id: 1 } }],
                    as: 'college',
                },
            },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            { $sort: { title: 1 } },
        ])
            .collation({ locale: 'en', strength: 2 });
        return ResponseHandler_1.default.success(groups);
    }
    async getAllEmployerGroup() {
        const groups = await this.employerGroupModel
            .aggregate([
            {
                $lookup: {
                    from: 'employer-companies',
                    let: { groupId: '$_id' },
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$employerGroup', '$$groupId'] }] } } }, { $limit: 1 }, { $project: { _id: 1 } }],
                    as: 'employer',
                },
            },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            { $sort: { title: 1 } },
        ])
            .collation({ locale: 'en', strength: 2 });
        return ResponseHandler_1.default.success(groups);
    }
    async getPartnerGroupByTitle(title) {
        const group = await this.partnerGroupModel
            .findOne({
            title,
        })
            .exec();
        return ResponseHandler_1.default.success(group);
    }
    async getPartnerGroupByHex(color) {
        const group = await this.partnerGroupModel
            .findOne({
            color,
        })
            .exec();
        return ResponseHandler_1.default.success(group);
    }
    async getEmployerGroupByTitle(title) {
        const group = await this.employerGroupModel
            .findOne({
            title,
        })
            .exec();
        return ResponseHandler_1.default.success(group);
    }
    async getEmployerGroupByHex(color) {
        const group = await this.employerGroupModel
            .findOne({
            color,
        })
            .exec();
        return ResponseHandler_1.default.success(group);
    }
    async deleteGroup(groupId) {
        const college = await this.collegeModel
            .findOne({ partnerGroup: mongoose.Types.ObjectId(groupId) }, 'title')
            .lean()
            .exec();
        if (college) {
            return ResponseHandler_1.default.fail('Cannot delete partner-group added to a college.');
        }
        await this.partnerGroupModel.deleteOne({ _id: mongoose.Types.ObjectId(groupId) });
        return ResponseHandler_1.default.success({}, 'Successfully deleted.');
    }
    async deleteEmployerGroup(groupId) {
        const employer = await this.employerModel
            .findOne({ employerGroup: mongoose.Types.ObjectId(groupId) }, 'title')
            .lean()
            .exec();
        if (employer) {
            return ResponseHandler_1.default.fail('Cannot delete employer-group added to a employer.');
        }
        await this.employerGroupModel.deleteOne({ _id: mongoose.Types.ObjectId(groupId) });
        return ResponseHandler_1.default.success({}, 'Successfully deleted.');
    }
};
PartnerGroupsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('partner-groups')),
    __param(1, mongoose_1.InjectModel('employer-groups')),
    __param(2, mongoose_1.InjectModel('colleges')),
    __param(3, mongoose_1.InjectModel('employer-companies')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], PartnerGroupsService);
exports.PartnerGroupsService = PartnerGroupsService;
//# sourceMappingURL=partner-groups.service.js.map