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
const blogs_service_1 = require("./blogs.service");
const blog_tags_service_1 = require("../blog-tags/blog-tags.service");
const swagger_1 = require("@nestjs/swagger");
const blogNumId_dto_1 = require("../common/dto/blogNumId.dto");
const learnerBlogsList_dto_1 = require("./dto/learnerBlogsList.dto");
const sideBarBlogs_dto_1 = require("./dto/sideBarBlogs.dto");
const blogMainPage_dto_1 = require("./dto/blogMainPage.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
let LearnersBlogsController = class LearnersBlogsController {
    constructor(blogsService, blogTagsService) {
        this.blogsService = blogsService;
        this.blogTagsService = blogTagsService;
    }
    async GetBlogs(blogsListDto) {
        blogsListDto.page = blogsListDto.page ? Number(blogsListDto.page) : 1;
        blogsListDto.perPage = blogsListDto.perPage ? Number(blogsListDto.perPage) : 10;
        blogsListDto.keyword = blogsListDto.keyword ? blogsListDto.keyword : '';
        blogsListDto.tag = blogsListDto.tag ? await this.blogTagsService.getTagBySlug(blogsListDto.tag) : '';
        const blogs = await this.blogsService.getPublishedBlogs(blogsListDto);
        return ResponseHandler_1.default.success(blogs);
    }
    async GetBlogsPageData(blogsMainPageDto) {
        blogsMainPageDto.sideBarBlogsPerpage = blogsMainPageDto.sideBarBlogsPerpage ? Number(blogsMainPageDto.sideBarBlogsPerpage) : 3;
        const [featuredBlog, blogTags, popularBlogs, latestBlogs] = await Promise.all([
            this.blogsService.getFeaturedBlog(),
            this.blogTagsService.getTagList(),
            this.blogsService.getSidebarBlogs({ perPage: blogsMainPageDto.sideBarBlogsPerpage, popular: true }),
            this.blogsService.getSidebarBlogs({ perPage: blogsMainPageDto.sideBarBlogsPerpage, popular: false }),
        ]);
        return ResponseHandler_1.default.success({ featuredBlog, blogTags, popularBlogs, latestBlogs });
    }
    async GetSideBarBlogs(sideBarBlogsDto) {
        sideBarBlogsDto.perPage = sideBarBlogsDto.perPage ? Number(sideBarBlogsDto.perPage) : 3;
        const blogs = await this.blogsService.getSidebarBlogs(sideBarBlogsDto);
        return ResponseHandler_1.default.success(blogs);
    }
    async GetBlogDetails(blogNumIdDto) {
        return await this.blogsService.getBlogDetails(blogNumIdDto.blogId);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get blogs list.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [learnerBlogsList_dto_1.LearnerBlogsListDto]),
    __metadata("design:returntype", Promise)
], LearnersBlogsController.prototype, "GetBlogs", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get blogs main page data.' }),
    common_1.Get('mainpage'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogMainPage_dto_1.BlogMainPageDto]),
    __metadata("design:returntype", Promise)
], LearnersBlogsController.prototype, "GetBlogsPageData", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sidebar blogs.' }),
    common_1.Get('sideBar'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sideBarBlogs_dto_1.SideBarBlogsDto]),
    __metadata("design:returntype", Promise)
], LearnersBlogsController.prototype, "GetSideBarBlogs", null);
__decorate([
    common_1.Get('/details/:blogId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogNumId_dto_1.BlogNumIdDto]),
    __metadata("design:returntype", Promise)
], LearnersBlogsController.prototype, "GetBlogDetails", null);
LearnersBlogsController = __decorate([
    swagger_1.ApiTags('Blogs(Learners)'),
    common_1.Controller('learners/blogs'),
    __metadata("design:paramtypes", [blogs_service_1.BlogsService, blog_tags_service_1.BlogTagsService])
], LearnersBlogsController);
exports.LearnersBlogsController = LearnersBlogsController;
//# sourceMappingURL=learner-blogs.controller.js.map