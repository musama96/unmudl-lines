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
const validators_1 = require("../../common/validators");
class RecentActivityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, userId: { required: false, type: () => String }, start: { required: true, type: () => String }, end: { required: true, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, collegeId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidInstructorId }),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], RecentActivityDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(true),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], RecentActivityDto.prototype, "courseId", void 0);
exports.RecentActivityDto = RecentActivityDto;
//# sourceMappingURL=recentActivity.dto.js.map