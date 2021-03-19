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
const contact_colleges_service_1 = require("./contact-colleges.service");
const create_contact_college_proposal_dto_1 = require("./dto/create-contact-college-proposal.dto");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const config_1 = require("../config/config");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const create_contact_college_draft_proposal_dto_1 = require("./dto/create-contact-college-draft-proposal.dto");
const contactCollegeProposalId_dto_1 = require("../common/dto/contactCollegeProposalId.dto");
const contact_colleges_proposals_list_dto_1 = require("./dto/contact-colleges-proposals-list.dto");
const update_contact_college_proposal_dto_1 = require("./dto/update-contact-college-proposal.dto");
const update_contact_college_draft_proposal_dto_1 = require("./dto/update-contact-college-draft-proposal.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
const fs = require("fs");
const s3_1 = require("../s3upload/s3");
const sharp = require('sharp');
let ContactCollegesController = class ContactCollegesController {
    constructor(contactCollegesService) {
        this.contactCollegesService = contactCollegesService;
    }
    async getProposals(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? listDto.page : 1;
        listDto.perPage = listDto.perPage ? listDto.perPage : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        if (user.collegeId) {
            listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
            listDto.userId = user._id;
            return await this.contactCollegesService.getProposalsForCollege(listDto);
        }
        else if (user.employerId) {
            listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
            listDto.employerAdminId = user._id;
            return await this.contactCollegesService.getProposalsForEmployer(listDto, user);
        }
        else {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
    }
    async getProposalDetails(contactCollegeProposalIdDto, user) {
        if (user.collegeId) {
            return await this.contactCollegesService.getProposalDetailsForCollege(contactCollegeProposalIdDto.id);
        }
        else if (user.employerId) {
            return await this.contactCollegesService.getProposalDetailsForEmployer(contactCollegeProposalIdDto.id);
        }
        else {
            return ResponseHandler_1.default.fail('Unauthorized', '', 401);
        }
    }
    async createProposal(createContactCollegeProposalDto, files, user) {
        createContactCollegeProposalDto.addedBy = user._id;
        createContactCollegeProposalDto.employer = user.employerId;
        if (files && files.attachments && files.attachments.length > 0) {
            createContactCollegeProposalDto.attachments = files.attachments.map(attachment => ({
                path: `${config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
                filename: attachment.filename,
            }));
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
                await Promise.all(files.attachments.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
            }
        }
        else if (createContactCollegeProposalDto.emptyAttachments) {
            createContactCollegeProposalDto.attachments = [];
        }
        else {
            delete createContactCollegeProposalDto.attachments;
        }
        if (!createContactCollegeProposalDto.showToEmployerAdmins) {
            createContactCollegeProposalDto.showToEmployerAdmins = [user._id];
        }
        else if (!createContactCollegeProposalDto.showToEmployerAdmins.find(id => id.toString() === user._id.toString())) {
            createContactCollegeProposalDto.showToEmployerAdmins.push(user._id);
        }
        return await this.contactCollegesService.createProposal(createContactCollegeProposalDto, user);
    }
    async updateProposal(files, contactCollegeProposalIdDto, updateContactCollegeProposalDto, user) {
        updateContactCollegeProposalDto.addedBy = user._id;
        updateContactCollegeProposalDto.employer = user.employerId;
        updateContactCollegeProposalDto.attachments = [];
        if (updateContactCollegeProposalDto.previousAttachments.length > 0) {
            updateContactCollegeProposalDto.attachments = updateContactCollegeProposalDto.previousAttachments.map((attachment) => {
                const dirs = typeof attachment === 'string' ? attachment.split('/') : [];
                return {
                    path: attachment.path ? attachment.path : attachment,
                    filename: attachment.filename ? attachment.filename : dirs[dirs.length - 1],
                };
            });
        }
        if (files && files.attachments && files.attachments.length > 0) {
            files.attachments.map(attachment => updateContactCollegeProposalDto.attachments.push({
                path: `${config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
                filename: attachment.filename,
            }));
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
                await Promise.all(files.attachments.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
            }
        }
        else if (updateContactCollegeProposalDto.emptyAttachments) {
            updateContactCollegeProposalDto.attachments = [];
        }
        if (!updateContactCollegeProposalDto.showToEmployerAdmins) {
            updateContactCollegeProposalDto.showToEmployerAdmins = [user._id];
        }
        else if (!updateContactCollegeProposalDto.showToEmployerAdmins.find(id => id.toString() === user._id.toString())) {
            updateContactCollegeProposalDto.showToEmployerAdmins.push(user._id);
        }
        return await this.contactCollegesService.updateProposal(contactCollegeProposalIdDto.id, updateContactCollegeProposalDto);
    }
    async disableProposal(contactCollegeProposalIdDto) {
        return await this.contactCollegesService.disableProposal(contactCollegeProposalIdDto.id);
    }
    async invertProposalStatus(contactCollegeProposalIdDto) {
        return await this.contactCollegesService.invertProposalStatus(contactCollegeProposalIdDto.id);
    }
    async getDraftProposals(listDto, user) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? listDto.page : 1;
        listDto.perPage = listDto.perPage ? listDto.perPage : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.employerAdminId = user._id;
        return await this.contactCollegesService.getDraftProposals(listDto, user);
    }
    async getDraftProposalDetails(contactCollegeProposalIdDto) {
        return await this.contactCollegesService.getDraftProposalDetails(contactCollegeProposalIdDto.id);
    }
    async createDraftProposal(createContactCollegeProposalDto, files, user) {
        createContactCollegeProposalDto.addedBy = user._id;
        createContactCollegeProposalDto.employer = user.employerId;
        if (files && files.attachments && files.attachments.length > 0) {
            createContactCollegeProposalDto.attachments = files.attachments.map(attachment => ({
                path: `${config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
                filename: attachment.filename,
            }));
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
                await Promise.all(files.attachments.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
            }
        }
        else if (createContactCollegeProposalDto.emptyAttachments) {
            createContactCollegeProposalDto.attachments = [];
        }
        else {
            delete createContactCollegeProposalDto.attachments;
        }
        return await this.contactCollegesService.createDraftProposal(createContactCollegeProposalDto);
    }
    async updateDraftProposal(contactCollegeProposalIdDto, updateContactCollegeDraftProposalDto, files, user) {
        updateContactCollegeDraftProposalDto.addedBy = user._id;
        updateContactCollegeDraftProposalDto.employer = user.employerId;
        updateContactCollegeDraftProposalDto.attachments = [];
        if (updateContactCollegeDraftProposalDto.previousAttachments.length > 0) {
            updateContactCollegeDraftProposalDto.attachments = updateContactCollegeDraftProposalDto.previousAttachments.map((attachment) => {
                const dirs = typeof attachment === 'string' ? attachment.split('/') : [];
                return {
                    path: attachment.path ? attachment.path : attachment,
                    filename: attachment.filename ? attachment.filename : dirs[dirs.length - 1],
                };
            });
        }
        if (files && files.attachments && files.attachments.length > 0) {
            files.attachments.map(attachment => updateContactCollegeDraftProposalDto.attachments.push({
                path: `${config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH}${attachment.filename}`,
                filename: attachment.filename,
            }));
            if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                files = s3_1.setFilenameAndDestination(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
                await Promise.all(files.attachments.map(async (attachment) => {
                    attachment.buffer = fs.readFileSync(attachment.path);
                    return null;
                }));
                s3_1.moveFilesToS3(config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, files);
            }
        }
        else if (updateContactCollegeDraftProposalDto.emptyAttachments) {
            updateContactCollegeDraftProposalDto.attachments = [];
        }
        return await this.contactCollegesService.updateDraftProposal(contactCollegeProposalIdDto.id, updateContactCollegeDraftProposalDto);
    }
    async disableDraftProposal(contactCollegeProposalIdDto) {
        return await this.contactCollegesService.disableDraftProposal(contactCollegeProposalIdDto.id);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sorted and paginated list of contact college proposals.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_colleges_proposals_list_dto_1.ContactCollegesProposalsListDto, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "getProposals", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get contact college proposals details.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Get('/details/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "getProposalDetails", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Create new contact college proposal.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'attachments' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
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
    __metadata("design:paramtypes", [create_contact_college_proposal_dto_1.CreateContactCollegeProposalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "createProposal", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Update contact college proposal.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post('/update/:id'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'attachments' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.UploadedFiles()),
    __param(1, common_1.Param()),
    __param(2, common_1.Body()),
    __param(3, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto,
        update_contact_college_proposal_dto_1.UpdateContactCollegeProposalDto, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "updateProposal", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Disable draft proposal.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Delete(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "disableProposal", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Invert proposal status.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post('/invert-status/:id'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "invertProposalStatus", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sorted and paginated list of contact college draft proposals.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Get('draft'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_colleges_proposals_list_dto_1.ContactCollegesProposalsListDto, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "getDraftProposals", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get contact college proposals details.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Get('/draft/details/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "getDraftProposalDetails", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Create new contact college draft proposal.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post('draft'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'attachments' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __param(1, common_1.UploadedFiles()),
    __param(2, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_college_draft_proposal_dto_1.CreateContactCollegeDraftProposalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "createDraftProposal", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Update contact college draft proposal.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post('/draft/update/:id'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'attachments' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.COLLEGE_CONTACT_PROPOSALS_FILES_PATH);
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __param(1, common_1.Body()),
    __param(2, common_1.UploadedFiles()),
    __param(3, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto,
        update_contact_college_draft_proposal_dto_1.UpdateContactCollegeDraftProposalDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "updateDraftProposal", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Disable draft proposal.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Delete('/draft/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeProposalId_dto_1.ContactCollegeProposalIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegesController.prototype, "disableDraftProposal", null);
ContactCollegesController = __decorate([
    swagger_1.ApiTags('Contact Colleges'),
    common_1.Controller('contact-colleges'),
    __metadata("design:paramtypes", [contact_colleges_service_1.ContactCollegesService])
], ContactCollegesController);
exports.ContactCollegesController = ContactCollegesController;
//# sourceMappingURL=contact-colleges.controller.js.map