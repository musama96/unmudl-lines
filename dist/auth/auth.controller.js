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
const auth_service_1 = require("./auth.service");
const authCredentialsDto_1 = require("./dto/authCredentialsDto");
const swagger_1 = require("@nestjs/swagger");
const userAuthCredentila_dto_1 = require("./dto/userAuthCredentila.dto");
const employerAuthCredentialsDto_1 = require("./dto/employerAuthCredentialsDto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(authCredentialsDto) {
        return this.authService.login(authCredentialsDto);
    }
    userLogin(authCredentialsDto) {
        return this.authService.userLogin(authCredentialsDto, false);
    }
    collegeLogin(authCredentialsDto) {
        return this.authService.userLogin(authCredentialsDto, true);
    }
    employerLogin(authCredentialsDto) {
        return this.authService.employerLogin(authCredentialsDto);
    }
    learnerLogin(authCredentialsDto) {
        return this.authService.learnerLogin(authCredentialsDto);
    }
};
__decorate([
    common_1.Post('login'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authCredentialsDto_1.AuthCredentialsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Admin users sign in API.' }),
    swagger_1.ApiResponse({
        status: 200,
        description: 'Access Token will be sent back on successful login.',
    }),
    common_1.Post('user/login'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authCredentialsDto_1.AuthCredentialsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "userLogin", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'College users sign in API.' }),
    swagger_1.ApiResponse({
        status: 200,
        description: 'Access Token will be sent back on successful login.',
    }),
    common_1.Post('college/login'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authCredentialsDto_1.AuthCredentialsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "collegeLogin", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Employer users sign in API.' }),
    swagger_1.ApiResponse({
        status: 200,
        description: 'Access Token will be sent back on successful login.',
    }),
    common_1.Post('employer/login'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employerAuthCredentialsDto_1.EmployerAuthCredentialsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "employerLogin", null);
__decorate([
    common_1.Post('learner/login'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [userAuthCredentila_dto_1.UserAuthCredentialsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "learnerLogin", null);
AuthController = __decorate([
    swagger_1.ApiTags('Authentication'),
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map