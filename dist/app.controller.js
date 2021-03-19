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
const app_service_1 = require("./app.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const s3_1 = require("./s3upload/s3");
const ResponseHandler_1 = require("./common/ResponseHandler");
const uploadImage_dto_1 = require("./common/dto/uploadImage.dto");
const sharp = require('sharp');
const fs = require("fs");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async UpdateUserDetails(uploadImageDto, files) {
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
            files = s3_1.setFilenameAndDestination('uploads/', files);
            files.file[0].buffer = fs.readFileSync(files.file[0].path);
            s3_1.moveFilesToS3('uploads/', files);
        }
        return files && files.file && files.file[0]
            ? { success: true, location: '/uploads/' + files.file[0].filename }
            : { success: false, location: null };
    }
    async HealthCheckAPIs() {
        return ResponseHandler_1.default.success({}, 'Working fine');
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Upload images for TinyMCE.' }),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/');
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    common_1.Post('uploadImage'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [uploadImage_dto_1.UploadImageDto, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "UpdateUserDetails", null);
__decorate([
    common_1.Get('health-check'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "HealthCheckAPIs", null);
AppController = __decorate([
    common_1.Controller(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map