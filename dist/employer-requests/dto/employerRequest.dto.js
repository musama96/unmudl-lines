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
const config_1 = require("../../config/config");
const days_enum_1 = require("../../common/enums/days.enum");
const timezone_enum_1 = require("../../common/enums/timezone.enum");
var ContactTime;
(function (ContactTime) {
    ContactTime["MORNING"] = "morning";
    ContactTime["EVENING"] = "evening";
    ContactTime["AFTERNOON"] = "afternoon";
})(ContactTime || (ContactTime = {}));
class EmployerRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => String }, phoneNumber: { required: true, type: () => String }, contactPerson: { required: true, type: () => String }, employerName: { required: true, type: () => String }, location: { required: true, type: () => String }, totalEmployees: { required: false, type: () => Number }, additionalInformation: { required: false, type: () => String }, contactTime: { required: true, enum: ContactTime }, dayOfWeek: { required: true, enum: require("../../common/enums/days.enum").Days }, timezone: { required: true, enum: require("../../common/enums/timezone.enum").TIMEZONE } };
    }
}
__decorate([
    class_validator_1.IsEmail({}, { message: responseMessages_1.default.contact.invalidEmail }),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "email", void 0);
__decorate([
    class_validator_1.Matches(config_1.PHONE_NUMBER_REGEX, '', { message: responseMessages_1.default.common.invalidPhoneNumber }),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "phoneNumber", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "contactPerson", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "employerName", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "location", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "additionalInformation", void 0);
__decorate([
    class_validator_1.IsEnum(ContactTime, { message: responseMessages_1.default.common.invalidContactTime }),
    swagger_1.ApiProperty({ default: 'afternoon' }),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "contactTime", void 0);
__decorate([
    class_validator_1.IsEnum(days_enum_1.Days),
    swagger_1.ApiProperty({ default: 'afternoon' }),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "dayOfWeek", void 0);
__decorate([
    class_validator_1.IsEnum(timezone_enum_1.TIMEZONE),
    swagger_1.ApiProperty({ default: 'afternoon' }),
    __metadata("design:type", String)
], EmployerRequestDto.prototype, "timezone", void 0);
exports.EmployerRequestDto = EmployerRequestDto;
//# sourceMappingURL=employerRequest.dto.js.map