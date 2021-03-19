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
const index_1 = require("../validators/index");
class ListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: true, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, collegeId: { required: false, type: () => String }, employerId: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, sortBy: { required: false, type: () => String }, courseId: { required: false, type: () => String }, learnerId: { required: false, type: () => String }, status: { required: false, type: () => [String] } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], ListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], ListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], ListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    index_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], ListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    index_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidEmployerId }),
    __metadata("design:type", String)
], ListDto.prototype, "employerId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    index_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], ListDto.prototype, "courseId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    index_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidLearnerId }),
    __metadata("design:type", String)
], ListDto.prototype, "learnerId", void 0);
exports.ListDto = ListDto;
//# sourceMappingURL=list.dto.js.map