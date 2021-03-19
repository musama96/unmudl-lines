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
const revenueAnalyticsCount_dto_1 = require("../../enrollments/dto/revenueAnalyticsCount.dto");
class PerformanceIndicatorsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { coursesStart: { required: false, type: () => String }, coursesEnd: { required: false, type: () => String }, learnersStart: { required: false, type: () => String }, learnersEnd: { required: false, type: () => String }, collegesStart: { required: false, type: () => String }, collegesEnd: { required: false, type: () => String }, type: { required: false, enum: require("../../enrollments/dto/revenueAnalyticsCount.dto").UserType } };
    }
}
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "coursesStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "coursesEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "learnersStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "learnersEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "collegesStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "collegesEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'College can view unmudl analytics if selected.' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(revenueAnalyticsCount_dto_1.UserType, { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "type", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], PerformanceIndicatorsDto.prototype, "end", void 0);
exports.PerformanceIndicatorsDto = PerformanceIndicatorsDto;
//# sourceMappingURL=performanceIndicators.dto.js.map