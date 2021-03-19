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
const courses_service_1 = require("../courses/courses.service");
const blogs_service_1 = require("../blogs/blogs.service");
const swagger_1 = require("@nestjs/swagger");
const updateLandingPage_dto_1 = require("./dto/updateLandingPage.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const landing_page_service_1 = require("./landing-page.service");
const updateLandingPartners_dto_1 = require("./dto/updateLandingPartners.dto");
const updateLandingFeaturedCourses_dto_1 = require("./dto/updateLandingFeaturedCourses.dto");
const updateLandingHighlyRatedCourses_dto_1 = require("./dto/updateLandingHighlyRatedCourses.dto");
const updateLandingBlogs_dto_1 = require("./dto/updateLandingBlogs.dto");
const searchCourses_dto_1 = require("./dto/searchCourses.dto");
const updateFooterContent_dto_1 = require("./dto/updateFooterContent.dto");
const updateLandingCredentialCourses_dto_1 = require("./dto/updateLandingCredentialCourses.dto");
const updatePreviewContent_dto_1 = require("./dto/updatePreviewContent.dto");
const s3_1 = require("../s3upload/s3");
const sharp = require('sharp');
const fs = require("fs");
let LandingPageController = class LandingPageController {
    constructor(coursesService, blogsService, landingPageService) {
        this.coursesService = coursesService;
        this.blogsService = blogsService;
        this.landingPageService = landingPageService;
    }
    async GetLandingPageInfo() {
        return await this.landingPageService.getLandingPage();
    }
    async GetLandingPageData() {
        return await this.landingPageService.getLearnersLandingPage();
    }
    async GetCoursesDropdown(searchCoursesDto) {
        searchCoursesDto.keyword = searchCoursesDto.keyword ? searchCoursesDto.keyword : '';
        searchCoursesDto.collegeId = searchCoursesDto.collegeId ? searchCoursesDto.collegeId : null;
        searchCoursesDto.perPage = Number(searchCoursesDto.perPage) ? Number(searchCoursesDto.perPage) : 10;
        return await this.landingPageService.getCoursesDropdown(searchCoursesDto);
    }
    async GetCoursesList(searchCoursesDto) {
        searchCoursesDto.keyword = searchCoursesDto.keyword ? searchCoursesDto.keyword : '';
        searchCoursesDto.collegeId = searchCoursesDto.collegeId ? searchCoursesDto.collegeId : null;
        searchCoursesDto.perPage = Number(searchCoursesDto.perPage) ? Number(searchCoursesDto.perPage) : 20;
        return await this.landingPageService.getSearchedCourses(searchCoursesDto);
    }
    async UpdateLandingPageInfo(updateLandingDto, files) {
        if (files && files.cover && files.cover[0]) {
            updateLandingDto.coverPhoto = '/uploads/' + files.cover[0].filename;
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination('uploads/', files);
                files.cover[0].buffer = fs.readFileSync(files.cover[0].path);
                s3_1.moveFilesToS3('uploads/', files);
            }
        }
        updateLandingDto.hyperlink = updateLandingDto.hyperlink ? updateLandingDto.hyperlink : null;
        updateLandingDto.pictureCredits = updateLandingDto.pictureCredits ? updateLandingDto.pictureCredits : null;
        return await this.landingPageService.updateLandingPageInfo(updateLandingDto);
    }
    async UpdateLandingPagePartners(updateLandingPartnersDto) {
        return await this.landingPageService.updateLandingPagePartners(updateLandingPartnersDto.partners);
    }
    async UpdateLandingPageFeaturedCourses(updateLandingFeaturedCoursesDto) {
        return await this.landingPageService.updateLandingPageFeaturedCourses(updateLandingFeaturedCoursesDto);
    }
    async UpdateLandingPageHighlyRatedCourses(updateLandingHighlyRatedCoursesDto) {
        return await this.landingPageService.updateLandingPageHighlyRatedCourses(updateLandingHighlyRatedCoursesDto);
    }
    async UpdateLandingPageCredentialCourses(updateLandingCredentialCoursesDto) {
        return await this.landingPageService.updateLandingPageCredentialCourses(updateLandingCredentialCoursesDto);
    }
    async UpdateLandingPageBlogs(updateLandingBlogsDto) {
        return await this.landingPageService.updateLandingPageBlogs(updateLandingBlogsDto);
    }
    async updateFooterContent(updateFooterContentDto) {
        return await this.landingPageService.updateFooterContent(updateFooterContentDto);
    }
    async updatePreviewContent(updatePreviewContentDto) {
        return await this.landingPageService.updatePreviewContent(updatePreviewContentDto.previewContent);
    }
    async getAboutUs() {
        return await this.landingPageService.getAboutUs();
    }
    async getWhyUnmudl() {
        return await this.landingPageService.getWhyUnmudl();
    }
    async getPrivacyPolicy() {
        return await this.landingPageService.getPrivacyPolicy();
    }
    async getTermsOfService() {
        return await this.landingPageService.getTermsOfService();
    }
    async getAccessibility() {
        return await this.landingPageService.getAccessibility();
    }
    async getPreviewContent() {
        return await this.landingPageService.getPreviewContent();
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get landing page alt tag, main title and tag line.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "GetLandingPageInfo", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get landing page data for learners.' }),
    common_1.Get('/data'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "GetLandingPageData", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    swagger_1.ApiOperation({ summary: 'Get list of courses  matching search.' }),
    common_1.Get('courses'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [searchCourses_dto_1.SearchCoursesDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "GetCoursesDropdown", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get list of courses  matching search.' }),
    common_1.Get('searchedCourses'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [searchCourses_dto_1.SearchCoursesDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "GetCoursesList", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiOperation({ summary: 'Update landing page cover, alt tag, main title and tag line.' }),
    common_1.Post('update-basic'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/');
            },
            filename: (req, file, cb) => {
                cb(null, `main-cover-${Date.now()}.jpg`);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLandingPage_dto_1.UpdateLandingPageDto, Object]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "UpdateLandingPageInfo", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update landing page partners list.' }),
    common_1.Post('update-partners'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLandingPartners_dto_1.UpdateLandingPartnersDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "UpdateLandingPagePartners", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update landing page featured courses list.' }),
    common_1.Post('update-featured-courses'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLandingFeaturedCourses_dto_1.UpdateLandingFeaturedCoursesDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "UpdateLandingPageFeaturedCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update landing page highly rated list.' }),
    common_1.Post('update-highly-rated-courses'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLandingHighlyRatedCourses_dto_1.UpdateLandingHighlyRatedCoursesDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "UpdateLandingPageHighlyRatedCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update landing page highly rated list.' }),
    common_1.Post('update-credential-courses'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLandingCredentialCourses_dto_1.UpdateLandingCredentialCoursesDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "UpdateLandingPageCredentialCourses", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update landing page blogs list.' }),
    common_1.Post('update-blogs'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateLandingBlogs_dto_1.UpdateLandingBlogsDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "UpdateLandingPageBlogs", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update footer pages content.' }),
    common_1.Post('update-footer-content'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateFooterContent_dto_1.UpdateFooterContentDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "updateFooterContent", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    swagger_1.ApiOperation({ summary: 'Update preview page content.' }),
    common_1.Post('update-preview-content'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updatePreviewContent_dto_1.UpdatePreviewContentDto]),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "updatePreviewContent", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get data for about us page.' }),
    common_1.Get('about-us'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "getAboutUs", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get data for why unmudl page.' }),
    common_1.Get('why-unmudl'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "getWhyUnmudl", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get data for privacy policy page.' }),
    common_1.Get('privacy-policy'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "getPrivacyPolicy", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get data for terms of service page.' }),
    common_1.Get('terms-of-service'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "getTermsOfService", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get data for accessibility page.' }),
    common_1.Get('accessibility'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "getAccessibility", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get content for preview page.' }),
    common_1.Get('preview-content'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LandingPageController.prototype, "getPreviewContent", null);
LandingPageController = __decorate([
    swagger_1.ApiTags('Landing Page'),
    common_1.Controller('landing-page'),
    __metadata("design:paramtypes", [courses_service_1.CoursesService,
        blogs_service_1.BlogsService,
        landing_page_service_1.LandingPageService])
], LandingPageController);
exports.LandingPageController = LandingPageController;
//# sourceMappingURL=landing-page.controller.js.map