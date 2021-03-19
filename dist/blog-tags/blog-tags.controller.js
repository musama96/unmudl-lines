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
const blog_tags_service_1 = require("./blog-tags.service");
const createBlogTag_dto_1 = require("./dto/createBlogTag.dto");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const list_dto_1 = require("./dto/list.dto");
const tagIdDto_dto_1 = require("./dto/tagIdDto.dto");
let BlogTagsController = class BlogTagsController {
    constructor(blogTagsService) {
        this.blogTagsService = blogTagsService;
    }
    async CreateBlogTag(createBlogTagDto) {
        return await this.blogTagsService.createBlogTag(createBlogTagDto);
    }
    async GetBlogTags(keywordDto) {
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        return await this.blogTagsService.getTags(keywordDto);
    }
    async GetAllBlogTags(keywordDto) {
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        return await this.blogTagsService.getAllTags(keywordDto.keyword);
    }
    async DeleteTag(tagIdDto) {
        return await this.blogTagsService.deleteTag(tagIdDto.tagId);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Add new blog tag.' }),
    common_1.Post(),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createBlogTag_dto_1.CreateBlogTagDto]),
    __metadata("design:returntype", Promise)
], BlogTagsController.prototype, "CreateBlogTag", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get blog tags list.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto]),
    __metadata("design:returntype", Promise)
], BlogTagsController.prototype, "GetBlogTags", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get all blog tags.' }),
    common_1.Get('/all'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], BlogTagsController.prototype, "GetAllBlogTags", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete partner groups.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager'),
    common_1.Delete(':tagId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tagIdDto_dto_1.TagIdDto]),
    __metadata("design:returntype", Promise)
], BlogTagsController.prototype, "DeleteTag", null);
BlogTagsController = __decorate([
    swagger_1.ApiTags('Blog Tags'),
    common_1.Controller('blog-tags'),
    __metadata("design:paramtypes", [blog_tags_service_1.BlogTagsService])
], BlogTagsController);
exports.BlogTagsController = BlogTagsController;
//# sourceMappingURL=blog-tags.controller.js.map