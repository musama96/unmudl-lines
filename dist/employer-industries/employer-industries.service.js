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
let EmployerIndustriesService = class EmployerIndustriesService {
    constructor(employerIndustryModel) {
        this.employerIndustryModel = employerIndustryModel;
    }
    async createIndustry(industry) {
        let newIndustry = new this.employerIndustryModel(industry);
        newIndustry = await newIndustry.save();
        return ResponseHandler_1.default.success(newIndustry, 'New industry created successfully.');
    }
    async getAllIndustries(params) {
        const { sortBy, sortOrder, keyword } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const industries = await this.employerIndustryModel
            .find({
            title: {
                $regex: keyword,
                $options: 'i',
            },
            deletedAt: null,
        })
            .sort(sort)
            .collation({ locale: 'en', strength: 2 })
            .lean();
        return ResponseHandler_1.default.success(industries);
    }
    async getIndustries(params) {
        const { sortBy, sortOrder, keyword, perPage, page } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const industries = await this.employerIndustryModel
            .find({
            title: {
                $regex: keyword,
                $options: 'i',
            },
            deletedAt: null,
        })
            .sort(sort)
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean();
        const rows = await this.employerIndustryModel
            .countDocuments({
            title: {
                $regex: keyword,
                $options: 'i',
            },
            deletedAt: null,
        })
            .exec();
        return ResponseHandler_1.default.success({ industries, rows });
    }
    async disableIndustry(id) {
        const disabledIndustry = await this.employerIndustryModel
            .findByIdAndUpdate(id, {
            $set: {
                deletedAt: new Date(),
            },
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(disabledIndustry, 'Industry disabled successfully.');
    }
    async enableIndustry(id) {
        const disabledIndustry = await this.employerIndustryModel
            .findByIdAndUpdate(id, {
            $set: {
                deletedAt: null,
            },
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(disabledIndustry, 'Industry enabled successfully.');
    }
};
EmployerIndustriesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-industries')),
    __metadata("design:paramtypes", [Object])
], EmployerIndustriesService);
exports.EmployerIndustriesService = EmployerIndustriesService;
//# sourceMappingURL=employer-industries.service.js.map