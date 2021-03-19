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
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
class ContactCollegesProposalsListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, category: { required: false, type: () => String }, subCategory: { required: false, type: () => String }, status: { required: false, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.common.invalidSortBy }),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "sortBy", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsIn(['asc', 'desc'], { message: responseMessages_1.default.common.invalidSortOrder }),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "sortOrder", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], ContactCollegesProposalsListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], ContactCollegesProposalsListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "employerId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ContactCollegesProposalsListDto.prototype, "employerAdminId", void 0);
exports.ContactCollegesProposalsListDto = ContactCollegesProposalsListDto;
//# sourceMappingURL=contact-colleges-proposals-list.dto.js.map