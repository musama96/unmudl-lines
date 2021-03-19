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
let ContactCollegeCategoriesService = class ContactCollegeCategoriesService {
    constructor(contactCollegeCategoryModel) {
        this.contactCollegeCategoryModel = contactCollegeCategoryModel;
    }
    async createCategory(category) {
        let newCategory = new this.contactCollegeCategoryModel(category);
        newCategory = await newCategory.save();
        return ResponseHandler_1.default.success(newCategory, 'New category created successfully.');
    }
    async getAllCategories(params) {
        const { sortBy, sortOrder, keyword } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const categories = await this.contactCollegeCategoryModel
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
        return ResponseHandler_1.default.success(categories);
    }
    async getCategories(params) {
        const { sortBy, sortOrder, keyword, perPage, page } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const categories = await this.contactCollegeCategoryModel
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
        const rows = await this.contactCollegeCategoryModel
            .countDocuments({
            title: {
                $regex: keyword,
                $options: 'i',
            },
            deletedAt: null,
        })
            .exec();
        return ResponseHandler_1.default.success({ categories, rows });
    }
    async disableCategory(id) {
        const disabledCategory = await this.contactCollegeCategoryModel
            .findByIdAndUpdate(id, {
            $set: {
                deletedAt: new Date(),
            },
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(disabledCategory, 'Category disabled successfully.');
    }
    async enableCategory(id) {
        const disabledCategory = await this.contactCollegeCategoryModel
            .findByIdAndUpdate(id, {
            $set: {
                deletedAt: null,
            },
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(disabledCategory, 'Category enabled successfully.');
    }
};
ContactCollegeCategoriesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('contact-college-categories')),
    __metadata("design:paramtypes", [Object])
], ContactCollegeCategoriesService);
exports.ContactCollegeCategoriesService = ContactCollegeCategoriesService;
//# sourceMappingURL=contact-college-categories.service.js.map