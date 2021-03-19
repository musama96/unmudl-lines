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
const employer_forums_service_1 = require("./employer-forums.service");
const createPost_dto_1 = require("./dto/createPost.dto");
const editPost_dto_1 = require("./dto/editPost.dto");
const postsList_dto_1 = require("./dto/postsList.dto");
const addTag_dto_1 = require("./dto/addTag.dto");
const addComment_dto_1 = require("./dto/addComment.dto");
const editComment_dto_1 = require("./dto/editComment.dto");
const postId_dto_1 = require("./dto/postId.dto");
const commentId_dto_1 = require("./dto/commentId.dto");
const repliesList_dto_1 = require("./dto/repliesList.dto");
const recentReplies_dto_1 = require("./dto/recentReplies.dto");
const dashboard_dto_1 = require("./dto/dashboard.dto");
const stats_dto_1 = require("./dto/stats.dto");
const addReply_dto_1 = require("./dto/addReply.dto");
const replyId_dto_1 = require("./dto/replyId.dto");
const editReply_dto_1 = require("./dto/editReply.dto");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const restrictCollegeUser_guard_1 = require("../auth/restrictCollegeUser.guard");
const restrictCollegeUser_decorator_1 = require("../auth/restrictCollegeUser.decorator");
let EmployerPostsController = class EmployerPostsController {
    constructor(employerPostsService) {
        this.employerPostsService = employerPostsService;
    }
    async GetLandingPageData(dashboardDto, user) {
        dashboardDto.repliesPerPage = dashboardDto.repliesPerPage ? dashboardDto.repliesPerPage : 7;
        const [counts, recentComments, { postList, totalPosts }] = await Promise.all([
            this.employerPostsService.getTotalPostsAndReplies(dashboardDto),
            this.employerPostsService.getRecentComments({ perPage: dashboardDto.repliesPerPage }),
            this.employerPostsService.getPosts({ keyword: '', page: 1, perPage: dashboardDto.postsPerPage, popular: false }),
        ]);
        return ResponseHandler_1.default.success({
            totalDiscussions: counts.totalDiscussions,
            totalComments: counts.totalReplies,
            recentComments,
            postList,
            totalPosts,
        });
    }
    async GetPostsCount(statsDto, user) {
        const counts = await this.employerPostsService.getTotalPostsAndReplies(statsDto);
        return ResponseHandler_1.default.success({
            totalDiscussions: counts.totalDiscussions,
            totalComments: counts.totalReplies,
        });
    }
    async AddPost(createPostDto, user) {
        if (user.type !== 'employer') {
            createPostDto.user = user._id;
        }
        else {
            createPostDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.createPost(createPostDto);
    }
    async EditPost(postIdDto, editPostDto, user) {
        editPostDto.postId = postIdDto.postId;
        return await this.employerPostsService.editPost(editPostDto, user);
    }
    async GetPosts(postListDto, user) {
        postListDto.page = postListDto.page ? postListDto.page : 1;
        postListDto.perPage = postListDto.perPage ? postListDto.perPage : 6;
        postListDto.keyword = postListDto.keyword ? postListDto.keyword : '';
        postListDto.user = user;
        const { postList, totalPosts } = await this.employerPostsService.getPosts(postListDto);
        return ResponseHandler_1.default.success({ postList, totalPosts });
    }
    async GetPost(postIdDto, repliesListDto, user) {
        repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
        repliesListDto.repliesPerPage = repliesListDto.repliesPerPage ? repliesListDto.repliesPerPage : 4;
        repliesListDto.postId = postIdDto.postId;
        const [counts, recentComments, post] = await Promise.all([
            this.employerPostsService.getTotalPostsAndReplies(repliesListDto),
            this.employerPostsService.getRecentComments({ perPage: repliesListDto.repliesPerPage }),
            this.employerPostsService.getPost(postIdDto.postId),
        ]);
        repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : post.totalComments > 0 ? post.totalComments : 4;
        const comments = await this.employerPostsService.getComments(repliesListDto);
        return ResponseHandler_1.default.success({
            totalDiscussions: counts.totalDiscussions,
            totalComments: counts.totalReplies,
            recentComments,
            post,
            comments,
        });
    }
    async DeletePost(postIdDto, user) {
        if (user.type !== 'employer') {
            postIdDto.user = user._id;
        }
        else {
            postIdDto.employerAdmin = user._id;
        }
        if (user.type !== 'employer' && !user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
            postIdDto.isAdmin = true;
        }
        return await this.employerPostsService.deletePost(postIdDto);
    }
    async AddComment(addCommentDto, user) {
        if (user.type !== 'employer') {
            addCommentDto.user = user._id;
        }
        else {
            addCommentDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.addComment(addCommentDto);
    }
    async EditComment(commentIdDto, editCommentDto, user) {
        editCommentDto.commentId = commentIdDto.commentId;
        if (user.type !== 'employer') {
            editCommentDto.user = user._id;
        }
        else {
            editCommentDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.editComment(editCommentDto);
    }
    async GetReplies(postIdDto, repliesListDto, user) {
        repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
        repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : 4;
        repliesListDto.postId = postIdDto.postId;
        const { commentsList, totalComments } = await this.employerPostsService.getComments(repliesListDto);
        return ResponseHandler_1.default.success({ commentsList, totalComments });
    }
    async GetRecentReplies(recentRepliesDto, user) {
        recentRepliesDto.perPage = recentRepliesDto.perPage ? recentRepliesDto.perPage : 4;
        const recentComments = await this.employerPostsService.getRecentComments(recentRepliesDto);
        return ResponseHandler_1.default.success(recentComments);
    }
    async DeleteComment(commentIdDto, user) {
        if (user.type !== 'employer') {
            commentIdDto.user = user._id;
            if (!user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
                commentIdDto.isAdmin = true;
            }
        }
        else {
            commentIdDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.deleteComment(commentIdDto);
    }
    async GetTags(keywordDto) {
        const keyword = keywordDto.keyword ? keywordDto.keyword : '';
        const tags = await this.employerPostsService.getTags(keyword);
        return ResponseHandler_1.default.success(tags);
    }
    async AddTag(addTagDto, user) {
        return await this.employerPostsService.addTag(addTagDto);
    }
    async AddReply(addReplyDto, user) {
        if (user.type !== 'employer') {
            addReplyDto.user = user._id;
        }
        else {
            addReplyDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.addReply(addReplyDto);
    }
    async EditReply(replyIdDto, editReplyDto, user) {
        editReplyDto.replyId = replyIdDto.replyId;
        if (user.type !== 'employer') {
            editReplyDto.user = user._id;
        }
        else {
            editReplyDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.editReply(editReplyDto);
    }
    async DeleteReply(replyIdDto, user) {
        if (user.type !== 'employer') {
            replyIdDto.user = user._id;
            if (!user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
                replyIdDto.isAdmin = true;
            }
        }
        else {
            replyIdDto.employerAdmin = user._id;
        }
        return await this.employerPostsService.deleteReply(replyIdDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get comunity forum landing page data.' }),
    common_1.Get('dashboard'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetLandingPageData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get total participants and total posts count.' }),
    common_1.Get('stats'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stats_dto_1.StatsDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetPostsCount", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a comunity forum post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('posts'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPost_dto_1.CreatePostDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "AddPost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Edit a comunity forum post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Put('posts/:postId'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Body()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postId_dto_1.PostIdDto, editPost_dto_1.EditPostDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "EditPost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of posts.' }),
    common_1.Get('posts'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postsList_dto_1.PostListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetPosts", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get single post details with replies.' }),
    common_1.Get('posts/:postId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Query()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postId_dto_1.PostIdDto, repliesList_dto_1.RepliesListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetPost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Delete('/posts/:postId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postId_dto_1.PostIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "DeletePost", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add a reply to a post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('comments'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addComment_dto_1.AddCommentDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "AddComment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Edit reply.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Put('comments/:commentId'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Body()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commentId_dto_1.CommentIdDto, editComment_dto_1.EditCommentDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "EditComment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of post comments.' }),
    common_1.Get('comments/:postId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Query()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [postId_dto_1.PostIdDto, repliesList_dto_1.RepliesListDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetReplies", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get paginated list of posts replies.' }),
    common_1.Get('recentComments'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recentReplies_dto_1.RecentRepliesDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetRecentReplies", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete a reply.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Delete('comments/:commentId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commentId_dto_1.CommentIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "DeleteComment", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get tags for posts.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Get('tags'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "GetTags", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a tag for posts.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('tags'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addTag_dto_1.AddTagDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "AddTag", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add a reply to a post.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post('replies'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addReply_dto_1.AddReplyDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "AddReply", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Edit reply.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Put('replies/:replyId'),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, common_1.Body()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [replyId_dto_1.ReplyIdDto, editReply_dto_1.EditReplyDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "EditReply", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete a reply.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Delete('replies/:replyId'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard, restrictCollegeUser_guard_1.RestrictCollegeUserGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'recruiter'),
    restrictCollegeUser_decorator_1.RestrictCollegeUser(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [replyId_dto_1.ReplyIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerPostsController.prototype, "DeleteReply", null);
EmployerPostsController = __decorate([
    swagger_1.ApiTags('Employer Forum'),
    common_1.Controller('employer-forums'),
    __metadata("design:paramtypes", [employer_forums_service_1.EmployerPostsService])
], EmployerPostsController);
exports.EmployerPostsController = EmployerPostsController;
//# sourceMappingURL=employer-forums.controller.js.map