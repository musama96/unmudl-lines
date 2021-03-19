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
var UserType;
(function (UserType) {
    UserType["COLLEGE"] = "college";
    UserType["UNMUDL"] = "unmudl";
})(UserType = exports.UserType || (exports.UserType = {}));
class RevenueAnalyticsCountDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { start: { required: false, type: () => String }, end: { required: false, type: () => String }, graphStart: { required: false, type: () => String }, graphEnd: { required: false, type: () => String }, sort: { required: false, type: () => Boolean }, type: { required: false, enum: require("./revenueAnalyticsCount.dto").UserType } };
    }
}
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], RevenueAnalyticsCountDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], RevenueAnalyticsCountDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], RevenueAnalyticsCountDto.prototype, "graphStart", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], RevenueAnalyticsCountDto.prototype, "graphEnd", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'true for highest, false for lowest grossing date' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean({ message: responseMessages_1.default.common.invalidRevenueSort }),
    __metadata("design:type", Boolean)
], RevenueAnalyticsCountDto.prototype, "sort", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'College can view unmudl analytics if selected.' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(UserType, { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], RevenueAnalyticsCountDto.prototype, "type", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], RevenueAnalyticsCountDto.prototype, "collegeId", void 0);
exports.RevenueAnalyticsCountDto = RevenueAnalyticsCountDto;
//# sourceMappingURL=revenueAnalyticsCount.dto.js.map