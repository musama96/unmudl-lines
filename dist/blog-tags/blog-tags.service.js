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
const ResponseHandler_1 = require("../common/ResponseHandler");
const mongoose_1 = require("@nestjs/mongoose");
const slugify = require("slugify");
const mongoose = require("mongoose");
let BlogTagsService = class BlogTagsService {
    constructor(blogTagModel, blogModel) {
        this.blogTagModel = blogTagModel;
        this.blogModel = blogModel;
    }
    async createBlogTag(tag) {
        const check = await this.blogTagModel.findOne({
            title: tag.title,
        }).exec();
        if (check) {
            return ResponseHandler_1.default.fail('Duplicate tags not allowed.');
        }
        else {
            tag.slug = slugify(tag.title, { lower: true });
            let newTag = new this.blogTagModel(tag);
            newTag = await newTag.save();
            return ResponseHandler_1.default.success(newTag);
        }
    }
    async getTags(params) {
        const { keyword, page, perPage } = params;
        const tags = await this.blogTagModel.find().byKeyword(keyword).paginate(page, perPage).exec();
        return ResponseHandler_1.default.success(tags);
    }
    async getTagBySlug(slug) {
        const tag = await this.blogTagModel.findOne({ slug }, 'title').lean();
        return tag._id;
    }
    async getAllTags(keyword) {
        const tags = await this.blogTagModel.find().byKeyword(keyword).exec();
        return ResponseHandler_1.default.success(tags);
    }
    async getTagList() {
        const tags = await this.blogTagModel.find({}, 'title slug').lean();
        return tags;
    }
    async deleteTag(tagId) {
        const blog = await this.blogModel.findOne({ tags: mongoose.Types.ObjectId(tagId) }, 'title')
            .lean().exec();
        if (blog) {
            return ResponseHandler_1.default.fail('Cannot delete tag added to a blog.');
        }
        await this.blogTagModel.deleteOne({ _id: mongoose.Types.ObjectId(tagId) });
        return ResponseHandler_1.default.success({}, 'Successfully deleted.');
    }
};
BlogTagsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('blog-tags')),
    __param(1, mongoose_1.InjectModel('blogs')),
    __metadata("design:paramtypes", [Object, Object])
], BlogTagsService);
exports.BlogTagsService = BlogTagsService;
//# sourceMappingURL=blog-tags.service.js.map