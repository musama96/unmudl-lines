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
const createBlog_enum_1 = require("../../common/enums/createBlog.enum");
const validators_1 = require("../../common/validators");
class CreateBlogDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { headerImage: { required: false, type: () => Object }, title: { required: true, type: () => String }, featured: { required: false, type: () => Number }, altText: { required: false, type: () => String }, contributors: { required: false, type: () => [String] }, employerContributors: { required: false, type: () => [String] }, tags: { required: false, type: () => [String] }, content: { required: true, type: () => String }, excerpt: { required: true, type: () => String }, tagline: { required: true, type: () => String }, status: { required: false, enum: require("../../common/enums/createBlog.enum").BlogStatus }, publishDate: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateBlogDto.prototype, "headerImage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "headerImageThumbnail", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "author", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "employerAuthor", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "employerId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "type", void 0);
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.title }),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Only for unmudl admins.', default: 1 }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateBlogDto.prototype, "featured", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.altText }),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "altText", void 0);
__decorate([
    validators_1.IsArray(true, { message: responseMessages_1.default.createBlog.contributors }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createBlog.contributors, each: true }),
    __metadata("design:type", Array)
], CreateBlogDto.prototype, "contributors", void 0);
__decorate([
    validators_1.IsArray(true, { message: responseMessages_1.default.createBlog.employerContributors }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createBlog.employerContributors, each: true }),
    __metadata("design:type", Array)
], CreateBlogDto.prototype, "employerContributors", void 0);
__decorate([
    class_validator_1.IsOptional(),
    validators_1.IsArray(true, { message: responseMessages_1.default.createBlog.tags }),
    class_validator_1.ArrayMinSize(1),
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.tags, each: true }),
    __metadata("design:type", Array)
], CreateBlogDto.prototype, "tags", void 0);
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.createBlog.content }),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "content", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(500),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "excerpt", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MaxLength(500),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "tagline", void 0);
__decorate([
    class_validator_1.IsEnum(createBlog_enum_1.BlogStatus, { message: responseMessages_1.default.createBlog.status }),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "status", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "publishDate", void 0);
exports.CreateBlogDto = CreateBlogDto;
//# sourceMappingURL=createBlog.dto.js.map