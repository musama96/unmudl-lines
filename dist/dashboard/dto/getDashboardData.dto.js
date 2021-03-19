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
const validators_1 = require("../../common/validators");
var UserType;
(function (UserType) {
    UserType["COLLEGE"] = "college";
    UserType["UNMUDL"] = "unmudl";
})(UserType || (UserType = {}));
var Filter;
(function (Filter) {
    Filter["UNDERENROLLED"] = "underenrolled";
    Filter["OVERENROLLED"] = "overenrolled";
})(Filter || (Filter = {}));
class GetDashboardDataDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { start: { required: false, type: () => String }, end: { required: false, type: () => String }, graphStart: { required: false, type: () => String }, graphEnd: { required: false, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, sort: { required: false, type: () => Boolean }, interval: { required: false, type: () => Number }, refundRate: { required: false, type: () => Number }, rejectionRate: { required: false, type: () => Number }, filter: { required: false, enum: Filter }, type: { required: true, enum: UserType }, collegeId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "graphStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "graphEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetDashboardDataDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetDashboardDataDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'true for highest, false for lowest grossing date' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean({ message: responseMessages_1.default.common.invalidRevenueSort }),
    __metadata("design:type", Boolean)
], GetDashboardDataDto.prototype, "sort", void 0);
__decorate([
    swagger_1.ApiProperty({ description: '1, 30 or 365' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetDashboardDataDto.prototype, "interval", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetDashboardDataDto.prototype, "refundRate", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetDashboardDataDto.prototype, "rejectionRate", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(Filter, { message: responseMessages_1.default.common.invalidStatsFilter }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "filter", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(UserType, { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Boolean)
], GetDashboardDataDto.prototype, "isUnmudlAdmin", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GetDashboardDataDto.prototype, "userCollegeId", void 0);
exports.GetDashboardDataDto = GetDashboardDataDto;
//# sourceMappingURL=getDashboardData.dto.js.map