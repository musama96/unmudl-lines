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
const contact_college_responses_service_1 = require("./contact-college-responses.service");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_proposal_response_dto_1 = require("./dto/create-proposal-response.dto");
const contact_colleges_service_1 = require("../contact-colleges/contact-colleges.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const config_1 = require("../config/config");
const contact_colleges_proposals_list_dto_1 = require("./dto/contact-colleges-proposals-list.dto");
const chat_service_1 = require("../chat/chat.service");
const fs = require("fs");
const ResponseHandler_1 = require("../common/ResponseHandler");
const ContactCollegeProposalResponseId_dto_1 = require("../common/dto/ContactCollegeProposalResponseId.dto");
const chatList_dto_1 = require("../chat/dto/chatList.dto");
const s3_1 = require("../s3upload/s3");
const sharp = require('sharp');
let ContactCollegeResponsesController = class ContactCollegeResponsesController {
    constructor(collegeResponsesService, contactCollegesService, chatService) {
        this.collegeResponsesService = collegeResponsesService;
        this.contactCollegesService = contactCollegesService;
        this.chatService = chatService;
    }
    async getProposalResponses(contactCollegesProposalResponsesListDto, user) {
        if (!user.collegeId && !user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized');
        }
        contactCollegesProposalResponsesListDto.collegeId = user.collegeId ? user.collegeId : null;
        contactCollegesProposalResponsesListDto.userId = user.collegeId ? user._id : null;
        contactCollegesProposalResponsesListDto.employerId = user.employerId ? user.employerId : null;
        contactCollegesProposalResponsesListDto.employerAdminId = user.employerId ? user._id : null;
        contactCollegesProposalResponsesListDto.employerAdminRole = user.employerId ? user.role : null;
        contactCollegesProposalResponsesListDto.sortBy = contactCollegesProposalResponsesListDto.sortBy
            ? contactCollegesProposalResponsesListDto.sortBy
            : 'createdAt';
        contactCollegesProposalResponsesListDto.sortOrder = contactCollegesProposalResponsesListDto.sortOrder === 'asc' ? '1' : '-1';
        contactCollegesProposalResponsesListDto.page = contactCollegesProposalResponsesListDto.page
            ? Number(contactCollegesProposalResponsesListDto.page)
            : 1;
        contactCollegesProposalResponsesListDto.perPage = contactCollegesProposalResponsesListDto.perPage
            ? Number(contactCollegesProposalResponsesListDto.perPage)
            : 10;
        contactCollegesProposalResponsesListDto.keyword = contactCollegesProposalResponsesListDto.keyword
            ? contactCollegesProposalResponsesListDto.keyword
            : '';
        contactCollegesProposalResponsesListDto.proposals = contactCollegesProposalResponsesListDto.proposals
            ? contactCollegesProposalResponsesListDto.proposals
            : [];
        return await this.collegeResponsesService.getProposalResponses(contactCollegesProposalResponsesListDto);
    }
    async getProposalResponseDetails(responseIdDto) {
        return await this.collegeResponsesService.getProposalResponseDetails(responseIdDto.id);
    }
    async createProposalResponse(createProposalResponseDto, files, user) {
        if (!user.collegeId) {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
        const { data: proposal } = await this.contactCollegesService.getProposalById(createProposalResponseDto.proposal);
        if (proposal) {
            createProposalResponseDto.appliedBy = user._id;
            createProposalResponseDto.college = user.collegeId;
            if (files && files.attachments && files.attachments.length > 0) {
                createProposalResponseDto.attachments = files.attachments.map(attachment => ({
                    path: `${config_1.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH}${attachment.filename}`,
                    filename: attachment.filename,
                }));
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH, files);
                    await Promise.all(files.attachments.map(async (attachment) => {
                        attachment.buffer = fs.readFileSync(attachment.path);
                        return null;
                    }));
                    s3_1.moveFilesToS3(config_1.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH, files);
                }
            }
            createProposalResponseDto.proposedBy = proposal.addedBy;
            if (!createProposalResponseDto.users.find(elem => elem === user._id.toString())) {
                createProposalResponseDto.users.push(user._id);
            }
            const chat = {
                groupName: proposal.title,
                college: user.collegeId,
                employer: proposal.employer,
                users: createProposalResponseDto.users,
                employerAdmins: proposal.showToEmployerAdmins,
                createdBy: user._id,
                createdByType: 'user',
                course: null,
                learner: null,
                module: chatList_dto_1.ChatModuleEnum.EMPLOYER_PROPOSAL_RESPONSE,
            };
            const { data: newChat } = await this.chatService.addChat(chat);
            const chatMessage = {
                chat: newChat._id,
                message: createProposalResponseDto.description,
                user: user._id,
                readByLearner: false,
                readByEmployerAdmins: [],
                readByUsers: [user._id],
            };
            const { data: newMessage } = await this.chatService.addChatReply(chatMessage);
            createProposalResponseDto.chat = newChat._id;
            const { data: newResponse, message } = await this.collegeResponsesService.createProposalResponse(createProposalResponseDto, proposal.employer);
            await this.chatService.updateChatModuleDocumentId(newChat._id, newResponse._id);
            return ResponseHandler_1.default.success(newResponse, message);
        }
        else {
            return ResponseHandler_1.default.fail('Proposal not found.');
        }
    }
};
__decorate([
    common_1.Get(),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_colleges_proposals_list_dto_1.ContactCollegesProposalResponsesListDto, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegeResponsesController.prototype, "getProposalResponses", null);
__decorate([
    common_1.Get('/details/:id'),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ContactCollegeProposalResponseId_dto_1.ContactCollegeProposalResponseIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegeResponsesController.prototype, "getProposalResponseDetails", null);
__decorate([
    common_1.Post(),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    swagger_1.ApiConsumes('multipart/form-data'),
    swagger_1.ApiOperation({ summary: 'Add contact college proposal response.' }),
    common_1.HttpCode(200),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'attachments' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.COLLEGE_CONTACT_PROPOSALS_RESPONSE_FILES_PATH);
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
    __metadata("design:paramtypes", [create_proposal_response_dto_1.CreateProposalResponseDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegeResponsesController.prototype, "createProposalResponse", null);
ContactCollegeResponsesController = __decorate([
    swagger_1.ApiTags('Contact College Responses'),
    common_1.Controller('contact-college-responses'),
    __metadata("design:paramtypes", [contact_college_responses_service_1.ContactCollegeResponsesService,
        contact_colleges_service_1.ContactCollegesService,
        chat_service_1.ChatService])
], ContactCollegeResponsesController);
exports.ContactCollegeResponsesController = ContactCollegeResponsesController;
//# sourceMappingURL=contact-college-responses.controller.js.map