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
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
var LearnersSearchType;
(function (LearnersSearchType) {
    LearnersSearchType["KEYWORD"] = "keyword";
    LearnersSearchType["LOCATION"] = "location";
})(LearnersSearchType || (LearnersSearchType = {}));
class LearnersSectionAdminDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userGrowthStart: { required: false, type: () => String }, userGrowthEnd: { required: false, type: () => String }, graphStart: { required: false, type: () => String }, graphEnd: { required: false, type: () => String }, learnersStart: { required: false, type: () => String }, learnersEnd: { required: false, type: () => String }, searchBy: { required: true, enum: LearnersSearchType }, interval: { required: false, type: () => Number }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, lat: { required: false, type: () => Number }, lng: { required: false, type: () => Number }, keyword: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "userGrowthStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "userGrowthEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "graphStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "graphEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "learnersStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "learnersEnd", void 0);
__decorate([
    class_validator_1.IsEnum(LearnersSearchType, { message: responseMessages_1.default.common.invalidLearnerSearchBy }),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "searchBy", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: 'createdAt' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "sortBy", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: 'desc' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "sortOrder", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], LearnersSectionAdminDto.prototype, "end", void 0);
exports.LearnersSectionAdminDto = LearnersSectionAdminDto;
//# sourceMappingURL=LearnersSectionAdmin.dto.js.map