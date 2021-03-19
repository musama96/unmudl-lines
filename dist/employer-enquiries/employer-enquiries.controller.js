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
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const employer_enquiries_service_1 = require("./employer-enquiries.service");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const getEnquiryMessages_dto_1 = require("./dto/getEnquiryMessages.dto");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const addUserEnquiry_dto_1 = require("./dto/addUserEnquiry.dto");
const addMembers_dto_1 = require("../enquiries/dto/addMembers.dto");
const messageId_dto_1 = require("./dto/messageId.dto");
const chatIdDto_1 = require("./dto/chatIdDto");
const addEmployerEnquiry_dto_1 = require("./dto/addEmployerEnquiry.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
let EmployerEnquiriesController = class EmployerEnquiriesController {
    constructor(employerEnquiriesService) {
        this.employerEnquiriesService = employerEnquiriesService;
    }
    async AddEnquiryMessage(addEmployerEnquiryDto, user) {
        if (user.type !== 'employer') {
            return ResponseHandler_1.default.fail('Only employers are allowed to initiate a chat.');
        }
        addEmployerEnquiryDto.employerAdminId = user._id;
        return await this.employerEnquiriesService.addEmployerEnquiryMessage(addEmployerEnquiryDto);
    }
    async GetEnquiries(user) {
        return await this.employerEnquiriesService.getUserEnquiries(user);
    }
    async GetChatGroupDetail(chatIdDto, user) {
        chatIdDto.user = user.type !== 'user' ? null : user;
        chatIdDto.employerAdminId = user.type !== 'employer' ? null : user._id;
        return await this.employerEnquiriesService.getChatGroupDetail(chatIdDto);
    }
    async GetEnquiryMessages(getEnquiryMessagesDto, user) {
        getEnquiryMessagesDto.page = getEnquiryMessagesDto.page ? Number(getEnquiryMessagesDto.page) : 1;
        getEnquiryMessagesDto.perPage = getEnquiryMessagesDto.perPage ? Number(getEnquiryMessagesDto.perPage) : 8;
        getEnquiryMessagesDto.userId = user.type !== 'user' ? null : user._id;
        getEnquiryMessagesDto.employerAdminId = user.type !== 'employer' ? null : user._id;
        getEnquiryMessagesDto.isAdmin = user.role.includes('admin');
        return await this.employerEnquiriesService.getEnquiryMessages(getEnquiryMessagesDto);
    }
    async AddAdminEnquiryReply(addUserEnquiryDto, user) {
        if (user.type === 'employer') {
            return ResponseHandler_1.default.fail('Only unmudl or college admins are allowed to access this api.');
        }
        addUserEnquiryDto.user = user;
        return await this.employerEnquiriesService.addUserEnquiry(addUserEnquiryDto, user);
    }
    async AddEnquiryMembers(addMembersDto, user) {
        return await this.employerEnquiriesService.addMembers(addMembersDto);
    }
    async UpdateReadBy(messageIdDto, user) {
        messageIdDto.userId = user.type !== 'user' ? null : user._id;
        messageIdDto.employerAdminId = user.type !== 'employer' ? null : user._id;
        return await this.employerEnquiriesService.updateReadBy(messageIdDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Create new enquiry or reply to existing one.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    common_1.HttpCode(200),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addEmployerEnquiry_dto_1.AddEmployerEnquiryDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "AddEnquiryMessage", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get enquiries.' }),
    common_1.Get(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "GetEnquiries", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Get chat group details.' }),
    common_1.Get('detail/:chatId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatIdDto_1.ChatIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "GetChatGroupDetail", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get enquiry messages.' }),
    common_1.Get('messages'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getEnquiryMessages_dto_1.GetEnquiryMessagesDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "GetEnquiryMessages", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add enquiries reply.' }),
    common_1.Post('admin-reply'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin', 'manager', 'moderator', 'instructor'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addUserEnquiry_dto_1.AddUserEnquiryDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "AddAdminEnquiryReply", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add members to an enquiry.' }),
    common_1.Post('add-members'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addMembers_dto_1.AddEnquiryMembersDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "AddEnquiryMembers", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'Update ready by.' }),
    common_1.Post('update-readBy'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [messageId_dto_1.MessageIdDto, Object]),
    __metadata("design:returntype", Promise)
], EmployerEnquiriesController.prototype, "UpdateReadBy", null);
EmployerEnquiriesController = __decorate([
    swagger_1.ApiTags('Employer Enquiries'),
    common_1.Controller('employer-enquiries'),
    __metadata("design:paramtypes", [employer_enquiries_service_1.EmployerEnquiriesService])
], EmployerEnquiriesController);
exports.EmployerEnquiriesController = EmployerEnquiriesController;
//# sourceMappingURL=employer-enquiries.controller.js.map