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
const validators_1 = require("../../common/validators");
var PublishStatus;
(function (PublishStatus) {
    PublishStatus["PENDING"] = "pending";
    PublishStatus["DRAFT"] = "draft";
    PublishStatus["PUBLISHED"] = "published";
    PublishStatus["UNPUBLISHED"] = "unpublished";
    PublishStatus["DENIED"] = "denied";
})(PublishStatus || (PublishStatus = {}));
class UpdateBlogDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { headerImage: { required: false, type: () => Object }, featured: { required: false, type: () => Number }, title: { required: true, type: () => String }, _id: { required: false, type: () => String }, altText: { required: false, type: () => String }, contributors: { required: false, type: () => Object }, employerContributors: { required: false, type: () => [String] }, tags: { required: false, type: () => Object }, content: { required: true, type: () => String }, excerpt: { required: true, type: () => String }, tagline: { required: true, type: () => String }, status: { required: false, type: () => String }, publishDate: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateBlogDto.prototype, "headerImage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "headerImageThumbnail", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Only for unmudl admins.', default: 1 }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], UpdateBlogDto.prototype, "featured", void 0);
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.title }),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "title", void 0);
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidBlogId }),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "_id", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.altText }),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "altText", void 0);
__decorate([
    swagger_1.ApiProperty({ example: ['mongodb users id', 'mongodb users id'] }),
    validators_1.IsArray(true, { message: responseMessages_1.default.createBlog.contributors }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createBlog.contributors, each: true }),
    __metadata("design:type", Object)
], UpdateBlogDto.prototype, "contributors", void 0);
__decorate([
    validators_1.IsArray(true, { message: responseMessages_1.default.createBlog.employerContributors }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createBlog.employerContributors, each: true }),
    __metadata("design:type", Array)
], UpdateBlogDto.prototype, "employerContributors", void 0);
__decorate([
    class_validator_1.IsOptional(),
    swagger_1.ApiProperty({ example: ['mongodb blog-tag id', 'mongodb blog-tag id'] }),
    validators_1.IsArray(true, { message: responseMessages_1.default.createBlog.tags }),
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.tags, each: true }),
    __metadata("design:type", Object)
], UpdateBlogDto.prototype, "tags", void 0);
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.content }),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "content", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(500),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "excerpt", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(500),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "tagline", void 0);
__decorate([
    class_validator_1.IsEnum(PublishStatus, { message: responseMessages_1.default.createBlog.status }),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "employerId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], UpdateBlogDto.prototype, "publishDate", void 0);
exports.UpdateBlogDto = UpdateBlogDto;
//# sourceMappingURL=updateBlog.dto.js.map