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
const create_contact_college_category_dto_1 = require("./dto/create-contact-college-category.dto");
const contact_college_categories_service_1 = require("./contact-college-categories.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const list_dto_1 = require("../common/dto/list.dto");
const get_all_categories_dto_1 = require("./dto/get-all-categories.dto");
const contactCollegeCategoryId_dto_1 = require("../common/dto/contactCollegeCategoryId.dto");
let ContactCollegeCategoriesController = class ContactCollegeCategoriesController {
    constructor(contactCollegeCategoriesService) {
        this.contactCollegeCategoriesService = contactCollegeCategoriesService;
    }
    async createCategory(createContactCollegeCategoryDto) {
        createContactCollegeCategoryDto.subcategories =
            createContactCollegeCategoryDto.subcategories && createContactCollegeCategoryDto.subcategories.length > 0
                ? createContactCollegeCategoryDto.subcategories.map(subcategory => ({
                    title: subcategory.title ? subcategory.title : subcategory,
                }))
                : [];
        return await this.contactCollegeCategoriesService.createCategory(createContactCollegeCategoryDto);
    }
    async getCategories(listDto) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.page = listDto.page ? Number(listDto.page) : 1;
        listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        return await this.contactCollegeCategoriesService.getCategories(listDto);
    }
    async getAllCategories(listDto) {
        listDto.keyword = listDto.keyword ? listDto.keyword : '';
        listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
        listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
        return await this.contactCollegeCategoriesService.getAllCategories(listDto);
    }
    async disableCategory(categoryIdDto) {
        return await this.contactCollegeCategoriesService.disableCategory(categoryIdDto.id);
    }
    async enableCategory(categoryIdDto) {
        return await this.contactCollegeCategoriesService.enableCategory(categoryIdDto.id);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Create new contact college category' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post(),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_college_category_dto_1.CreateContactCollegeCategoryDto]),
    __metadata("design:returntype", Promise)
], ContactCollegeCategoriesController.prototype, "createCategory", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sorted and paginated list of categories' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto]),
    __metadata("design:returntype", Promise)
], ContactCollegeCategoriesController.prototype, "getCategories", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Get sorted list of all categories' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Get('all'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_all_categories_dto_1.GetAllCategoriesDto]),
    __metadata("design:returntype", Promise)
], ContactCollegeCategoriesController.prototype, "getAllCategories", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Disable a category.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Delete(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeCategoryId_dto_1.ContactCollegeCategoryIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegeCategoriesController.prototype, "disableCategory", null);
__decorate([
    swagger_1.ApiOperation({ summary: 'Enable a category.' }),
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    roles_decorator_1.Roles('admin'),
    common_1.Post('/enable/:id'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contactCollegeCategoryId_dto_1.ContactCollegeCategoryIdDto]),
    __metadata("design:returntype", Promise)
], ContactCollegeCategoriesController.prototype, "enableCategory", null);
ContactCollegeCategoriesController = __decorate([
    swagger_1.ApiTags('Contact College Categories'),
    common_1.Controller('contact-college-categories'),
    __metadata("design:paramtypes", [contact_college_categories_service_1.ContactCollegeCategoriesService])
], ContactCollegeCategoriesController);
exports.ContactCollegeCategoriesController = ContactCollegeCategoriesController;
//# sourceMappingURL=contact-college-categories.controller.js.map