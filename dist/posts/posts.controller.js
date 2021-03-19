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
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const ResponseHandler_1 = require("../common/ResponseHandler");
const posts_service_1 = require("./posts.service");
const createPost_dto_1 = require("./dto/createPost.dto");
const editPost_dto_1 = require("./dto/editPost.dto");
const postsList_dto_1 = require("./dto/postsList.dto");
const addTag_dto_1 = require("./dto/addTag.dto");
const addReply_dto_1 = require("./dto/addReply.dto");
const editReply_dto_1 = require("./dto/editReply.dto");
const postId_dto_1 = require("./dto/postId.dto");
const replyId_dto_1 = require("./dto/replyId.dto");
const repliesList_dto_1 = require("./dto/repliesList.dto");
const recentReplies_dto_1 = require("./dto/recentReplies.dto");
const landingPage_dto_1 = require("./dto/landingPage.dto");
const reportPost_dto_1 = require("./dto/reportPost.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const updateReportStatus_dto_1 = require("./dto/updateReportStatus.dto");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
let PostsController = class PostsController {
    constructor(postsService) {
        this.postsService = postsService;
    }
    async GetLandingPageData(landingPageDto) {
        landingPageDto.repliesPerPage = landingPageDto.repliesPerPage ? landingPageDto.repliesPerPage : 7;
        const [counts, recentReplies] = await Promise.all([
            this.postsService.getTotalPostAndParticipants(),
            this.postsService.getRecentReplies({ perPage: landingPageDto.repliesPerPage }),
        ]);
        return ResponseHandler_1.default.success({
            totalParticipants: counts.totalParticipants,
            totalPosts: counts.totalPosts,
            recentReplies,
        });
    }
    async GetPostsCount() {
        const data = await this.postsService.getTotalPostAndParticipants();
        return ResponseHandler_1.default.success(data);
    }
    async AddPost(createPostDto, learner) {
        createPostDto.author = learner._id;
        return await this.postsService.createPost(createPostDto);
    }
    async EditPost(editPostDto, learner) {
        return await this.postsService.editPost(editPostDto, learner._id);
    }
    async GetPosts(postListDto) {
        postListDto.page = postListDto.page ? postListDto.page : 1;
        postListDto.perPage = postListDto.perPage ? postListDto.perPage : 6;
        postListDto.keyword = postListDto.keyword ? postListDto.keyword : '';
        const { postList, totalPosts } = await this.postsService.getPosts(postListDto);
        return ResponseHandler_1.default.success({ postList, totalPosts });
    }
    async GetPost(repliesListDto) {
        repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
        repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : 4;
        repliesListDto.recentRepliesPerPage = repliesListDto.recentRepliesPerPage ? repliesListDto.recentRepliesPerPage : 4;
        const [post, recentReplies] = await Promise.all([
            this.postsService.getPostByNumId(repliesListDto.numId),
            this.postsService.getRecentReplies({ perPage: repliesListDto.recentRepliesPerPage }),
        ]);
        repliesListDto.postId = post._id;
        const replies = await this.postsService.getReplies(repliesListDto);
        return ResponseHandler_1.default.success({ post, replies, recentReplies });
    }
    async DeletePost(postIdDto, learner) {
        postIdDto.learner = learner._id;
        if (learner.type !== 'learner' && !learner.collegeId && (learner.role === 'admin' || learner.role === 'superadmin')) {
            postIdDto.isAdmin = true;
        }
        return await this.postsService.deletePost(postIdDto);
    }
    async AddReply(addReplyDto, user) {
        if (user.type !== 'learner') {
            addReplyDto.user = user._id;
        }
        else {
            addReplyDto.learner = user._id;
        }
        return await this.postsService.addReply(addReplyDto);
    }
    async EditReply(editReplyDto, user) {
        if (user.type !== 'learner') {
            editReplyDto.user = user._id;
        }
        else {
            editReplyDto.learner = user._id;
        }
        return await this.postsService.editReply(editReplyDto);
    }
    async GetReplies(repliesListDto) {
        repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
        repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : 4;
        const { repliesList, totalReplies } = await this.postsService.getReplies(repliesListDto);
        return ResponseHandler_1.default.success({ repliesList, totalReplies });
    }
    async GetRecentReplies(recentRepliesDto) {
        recentRepliesDto.perPage = recentRepliesDto.perPage ? recentRepliesDto.perPage : 4;
        const recentReplies = await this.postsService.getRecentReplies(recentRepliesDto);
        return ResponseHandler_1.default.success(recentReplies);
    }
    async DeleteReply(replyIdDto, user) {
        if (user.type !== 'learner') {
            replyIdDto.user = user._id;
            if (!user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
                replyIdDto.isAdmin = true;
            }
        }
        else {
            replyIdDto.learner = user._id;
        }
        return await this.postsService.deleteReply(replyIdDto);
    }
    async GetTags() {
        const tags = await this.postsService.getTags();
        return ResponseHandler_1.default.success(tags);
    }
    async AddTag(addTagDto) {
        return await this.postsService.addTag(addTagDto);
    }
    async GetReport(paginationDto, user) {
        paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
        paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 8;
        return await this.postsService.getReports(paginationDto);
    }
    async AddReport(reportPostDto, user) {
        if (!reportPostDto.postId && !reportPostDto.replyId) {
            return ResponseHandler_1.default.fail('Provide post or reply id.');
        }
        if (user.type !== 'learner') {
            reportPostDto.userId = user._id;
        }
        else {
            reportPostDto.learnerId = user._id;
        }
        return await this.postsService.addReport(reportPostDto);
    }
    async UpdateReportStatus(updateReportStatusDto, user) {
        return await this.postsService.updateReportStatus(updateReportStatusDto);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get comunity forum landing page data.' }),
    common_1.Get('landingPage'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [landingPage_dto_1.LandingPageDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetLandingPageData", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get total participants and total posts count.' }),
    common_1.Get('count'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetPostsCount", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a comunity forum post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPost_dto_1.CreatePostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "AddPost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Edit a comunity forum post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('edit'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editPost_dto_1.EditPostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "EditPost", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get paginated list of posts.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postsList_dto_1.PostListDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetPosts", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get single post details with replies.' }),
    common_1.Get('details'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [repliesList_dto_1.RepliesListDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetPost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Delete(':postId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postId_dto_1.PostIdDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "DeletePost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add a reply to a post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('reply'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addReply_dto_1.AddReplyDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "AddReply", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Edit reply.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('reply/edit'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [editReply_dto_1.EditReplyDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "EditReply", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get paginated list of posts replies.' }),
    common_1.Get('replies'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [repliesList_dto_1.RepliesListDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetReplies", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get paginated list of posts replies.' }),
    common_1.Get('recentReplies'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recentReplies_dto_1.RecentRepliesDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetRecentReplies", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete a reply.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Delete('reply/:replyId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [replyId_dto_1.ReplyIdDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "DeleteReply", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get tags for posts.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Get('tags'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetTags", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a tag for posts.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('tags'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addTag_dto_1.AddTagDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "AddTag", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a tag for posts.' }),
    common_1.Get('report'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "GetReport", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a tag for posts.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('report'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reportPost_dto_1.ReportPostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "AddReport", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a tag for posts.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('report/updateStatus'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateReportStatus_dto_1.UpdateReportStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "UpdateReportStatus", null);
PostsController = __decorate([
    swagger_1.ApiTags('Posts (Comunity Forum)'),
    common_1.Controller('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
exports.PostsController = PostsController;
//# sourceMappingURL=posts.controller.js.map