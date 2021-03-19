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
const createBlog_dto_1 = require("./dto/createBlog.dto");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const s3_1 = require("../s3upload/s3");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("../config/config");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const blogId_dto_1 = require("../common/dto/blogId.dto");
const updateBlogPublished_dto_1 = require("./dto/updateBlogPublished.dto");
const updateBlog_dto_1 = require("./dto/updateBlog.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const blogsList_dto_1 = require("./dto/blogsList.dto");
const createBlog_enum_1 = require("../common/enums/createBlog.enum");
const ResponseHandler_1 = require("../common/ResponseHandler");
const setBlogsFeatured_dto_1 = require("./dto/setBlogsFeatured.dto");
const sharp = require('sharp');
const fs = require("fs");
let BlogsController = class BlogsController {
    constructor(blogsService) {
        this.blogsService = blogsService;
    }
    async Create(createBlogDto, files, user) {
        if (files && files.headerImage && files.headerImage[0]) {
            createBlogDto.headerImage = config_1.BLOGS_IMG_PATH + files.headerImage[0].filename;
            await sharp(files.headerImage[0].path)
                .resize(config_1.BLOG_THUMBNAIL_SIZE)
                .toFile(files.headerImage[0].path.replace('.', '_t.'));
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.BLOGS_IMG_PATH, files);
                files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
                files.headerImageThumbnail = [
                    Object.assign(Object.assign({}, files.headerImage[0]), { buffer: await sharp(files.headerImage[0].path)
                            .resize(config_1.BLOG_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.headerImage[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.BLOGS_IMG_PATH, files);
            }
            createBlogDto.headerImageThumbnail = (config_1.BLOGS_IMG_PATH + files.headerImage[0].filename).replace('.', '_t.');
        }
        if (user.type === 'employer') {
            createBlogDto.employerAuthor = user._id;
            createBlogDto.employerId = user.employerId;
            delete createBlogDto.collegeId;
            createBlogDto.type = 'employer';
        }
        else {
            createBlogDto.author = user._id;
            createBlogDto.collegeId = user.collegeId;
            delete createBlogDto.employerId;
            createBlogDto.type = 'college';
        }
        if ((user.collegeId || user.employerId) && createBlogDto.status !== createBlog_enum_1.BlogStatus.PENDING && createBlogDto.status !== createBlog_enum_1.BlogStatus.DRAFT) {
            createBlogDto.status = createBlog_enum_1.BlogStatus.PENDING;
        }
        if (user.collegeId || user.employerId) {
            createBlogDto.featured = null;
        }
        return await this.blogsService.createBlog(createBlogDto);
    }
    async UpdateBlog(updateBlogDto, files, user) {
        if (files && files.headerImage && files.headerImage[0]) {
            updateBlogDto.headerImage = config_1.BLOGS_IMG_PATH + files.headerImage[0].filename;
            await sharp(files.headerImage[0].path)
                .resize(config_1.BLOG_THUMBNAIL_SIZE)
                .toFile(files.headerImage[0].path.replace('.', '_t.'));
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.BLOGS_IMG_PATH, files);
                files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
                files.headerImageThumbnail = [
                    Object.assign(Object.assign({}, files.headerImage[0]), { buffer: await sharp(files.headerImage[0].path)
                            .resize(config_1.BLOG_THUMBNAIL_SIZE)
                            .toBuffer(), filename: files.headerImage[0].filename.replace('.', '_t.') }),
                ];
                s3_1.moveFilesToS3(config_1.BLOGS_IMG_PATH, files);
            }
            updateBlogDto.headerImageThumbnail = (config_1.BLOGS_IMG_PATH + files.headerImage[0].filename).replace('.', '_t.');
        }
        else {
            delete updateBlogDto.headerImage;
            delete updateBlogDto.headerImageThumbnail;
        }
        if (!updateBlogDto.featured) {
            updateBlogDto.featured = null;
        }
        if (user.type === 'employer') {
            updateBlogDto.employerId = user.employerId;
            delete updateBlogDto.collegeId;
        }
        else {
            updateBlogDto.collegeId = user.collegeId;
            delete updateBlogDto.employerId;
        }
        return await this.blogsService.updateBlog(updateBlogDto);
    }
    async GetBlogs(blogsListDto, user) {
        blogsListDto.page = blogsListDto.page ? Number(blogsListDto.page) : 1;
        blogsListDto.perPage = blogsListDto.perPage ? Number(blogsListDto.perPage) : 1;
        blogsListDto.keyword = blogsListDto.keyword ? blogsListDto.keyword : '';
        blogsListDto.sortOrder = blogsListDto.sortOrder === 'asc' ? '1' : '-1';
        if (user.type === 'employer') {
            blogsListDto.employerId = user.employerId;
        }
        else {
            blogsListDto.collegeId = user.collegeId;
        }
        return await this.blogsService.getBlogs(blogsListDto);
    }
    async GetCompleteBlogsSectionData(blogsListDto, user) {
        blogsListDto.page = blogsListDto.page ? Number(blogsListDto.page) : 1;
        blogsListDto.perPage = blogsListDto.perPage ? Number(blogsListDto.perPage) : 1;
        blogsListDto.keyword = blogsListDto.keyword ? blogsListDto.keyword : '';
        blogsListDto.sortOrder = blogsListDto.sortOrder === 'asc' ? '1' : '-1';
        if (user.type === 'employer') {
            blogsListDto.employerId = user.employerId;
        }
        else {
            blogsListDto.collegeId = user.collegeId;
        }
        const submittedBlogsResponse = await this.blogsService.getBlogs(blogsListDto);
        return ResponseHandler_1.default.success({
            submittedBlogs: submittedBlogsResponse.data,
        });
    }
    async GetBlogDetails(blogIdDto) {
        return await this.blogsService.getBlogById(blogIdDto.blogId);
    }
    async UpdateBlogPublishedStatus(updateBlogPublishedDto, user) {
        return await this.blogsService.updateBlogPublishedStatus(updateBlogPublishedDto, user._id);
    }
    async UpdateBlogsFeatured(setBlogsFeaturedDto) {
        setBlogsFeaturedDto.update = { featured: setBlogsFeaturedDto.status !== setBlogsFeatured_dto_1.FeaturedStatus.UNFEATURE ? 1 : null };
        return await this.blogsService.updateFeatured(setBlogsFeaturedDto);
    }
    async DeleteBlogById(blogIdDto) {
        return await this.blogsService.deleteBlogById(blogIdDto.blogId);
    }
    async RestoreBlogByOldId(blogIdDto, user) {
        return await this.blogsService.restoreBlogByOldId(blogIdDto.blogId, {
            employerId: user.employerId,
            collegeId: user.collegeId,
            userId: user._id,
        });
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiOperation({ summary: 'Create blog as pending or draft.' }),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'headerImage', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public/uploads/blogs-images/', { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public/uploads/blogs-images/');
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createBlog_dto_1.CreateBlogDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "Create", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Update blog details.' }),
    common_1.Post('/update'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([
        { name: 'headerImage', maxCount: 1 },
    ], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public/uploads/blogs-images/', { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public/uploads/blogs-images/');
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()), __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateBlog_dto_1.UpdateBlogDto, Object, Object]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "UpdateBlog", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get blogs list.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogsList_dto_1.BlogsListDto, Object]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "GetBlogs", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get blogs list.' }),
    common_1.Get('admin-home'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogsList_dto_1.BlogsListDto, Object]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "GetCompleteBlogsSectionData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get blog details.' }),
    common_1.Get('/details/:blogId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogId_dto_1.BlogIdDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "GetBlogDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Update blog published status.' }),
    common_1.Post('/update/status'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateBlogPublished_dto_1.UpdateBlogPublishedDto, Object]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "UpdateBlogPublishedStatus", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Update blog published status.' }),
    common_1.Post('/update/featured'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setBlogsFeatured_dto_1.SetBlogsFeaturedDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "UpdateBlogsFeatured", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Delete blog.' }),
    common_1.Delete(':blogId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogId_dto_1.BlogIdDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "DeleteBlogById", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Restore old blog.' }),
    common_1.Post('/restore/:blogId'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogId_dto_1.BlogIdDto, Object]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "RestoreBlogByOldId", null);
BlogsController = __decorate([
    swagger_1.ApiTags('Blogs'),
    common_1.Controller('blogs'),
    __metadata("design:paramtypes", [blogs_service_1.BlogsService])
], BlogsController);
exports.BlogsController = BlogsController;
//# sourceMappingURL=blogs.controller.js.map