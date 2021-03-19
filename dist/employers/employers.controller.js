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
const employers_service_1 = require("./employers.service");
const addEmployers_dto_1 = require("./dto/addEmployers.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const ResponseHandler_1 = require("../common/ResponseHandler");
const config_1 = require("../config/config");
const keyword_dto_1 = require("../common/dto/keyword.dto");
const s3_1 = require("../s3upload/s3");
const sharp = require('sharp');
const fs = require("fs");
let EmployersController = class EmployersController {
    constructor(employersService) {
        this.employersService = employersService;
    }
    async AddEmployers(addEmployerDto, files) {
        if (files && files.employersLogos) {
            files.employersLogos.forEach((logo, index) => {
                addEmployerDto.employers[index].logo = config_1.EMPLOYERS_LOGOS_PATH + logo.filename;
            });
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.EMPLOYERS_LOGOS_PATH, files);
                await Promise.all(files.employersLogos.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.EMPLOYERS_LOGOS_PATH, files);
            }
        }
        const employers = await this.employersService.createEmployers(addEmployerDto.employers);
        return ResponseHandler_1.default.success({
            employers,
        });
    }
    async GetEmployers(keywordDto) {
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        const employers = await this.employersService.getEmployers(keywordDto.keyword);
        return ResponseHandler_1.default.success(employers);
    }
    async GetEmployersForFilter(keywordDto) {
        keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
        keywordDto.collegeId = keywordDto.collegeId ? keywordDto.collegeId : null;
        const employers = await this.employersService.getEmployersForFilter(keywordDto);
        return ResponseHandler_1.default.success(employers);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create a course' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator'),
    common_1.Post('create'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'employersLogos' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './public/uploads/employers-logos/');
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Body()), __param(1, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addEmployers_dto_1.AddEmployerDto, Object]),
    __metadata("design:returntype", Promise)
], EmployersController.prototype, "AddEmployers", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get a list of available employers.' }),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], EmployersController.prototype, "GetEmployers", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get a list of available employers.' }),
    common_1.Get('list'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [keyword_dto_1.KeywordDto]),
    __metadata("design:returntype", Promise)
], EmployersController.prototype, "GetEmployersForFilter", null);
EmployersController = __decorate([
    swagger_1.ApiTags('Employers'),
    common_1.Controller('employers'),
    __metadata("design:paramtypes", [employers_service_1.EmployersService])
], EmployersController);
exports.EmployersController = EmployersController;
//# sourceMappingURL=employers.controller.js.map