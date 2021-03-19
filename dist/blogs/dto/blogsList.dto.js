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
const responseMessages_1 = require("../../config/responseMessages");
const swagger_1 = require("@nestjs/swagger");
var Status;
(function (Status) {
    Status["Pending"] = "pending";
    Status["Draft"] = "draft";
    Status["Published"] = "published";
    Status["Unpublished"] = "unpublished";
    Status["Featured"] = "featured";
    Status["Submitted"] = "submitted";
})(Status = exports.Status || (exports.Status = {}));
class BlogsListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, enum: require("./blogsList.dto").Status }, keyword: { required: false, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, sortOrder: { required: false, type: () => String }, sortBy: { required: false, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(Status, { message: responseMessages_1.default.createBlog.status }),
    __metadata("design:type", String)
], BlogsListDto.prototype, "status", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], BlogsListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], BlogsListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], BlogsListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], BlogsListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], BlogsListDto.prototype, "employerId", void 0);
exports.BlogsListDto = BlogsListDto;
//# sourceMappingURL=blogsList.dto.js.map