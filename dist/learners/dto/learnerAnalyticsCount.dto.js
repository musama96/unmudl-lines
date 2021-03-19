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
var UserType;
(function (UserType) {
    UserType["COLLEGE"] = "college";
    UserType["UNMUDL"] = "unmudl";
})(UserType || (UserType = {}));
class LearnerAnalyticsCountDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { start: { required: false, type: () => String }, end: { required: false, type: () => String }, enrolled: { required: false, type: () => Boolean }, type: { required: true, enum: UserType }, collegeId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], LearnerAnalyticsCountDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], LearnerAnalyticsCountDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'true for enrolled and false for sign ups' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean({ message: responseMessages_1.default.common.invalidEnrolledStatus }),
    __metadata("design:type", Boolean)
], LearnerAnalyticsCountDto.prototype, "enrolled", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(UserType, { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], LearnerAnalyticsCountDto.prototype, "type", void 0);
exports.LearnerAnalyticsCountDto = LearnerAnalyticsCountDto;
//# sourceMappingURL=learnerAnalyticsCount.dto.js.map