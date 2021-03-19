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
class CollegeInvitationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fullname: { required: true, type: () => String }, title: { required: true, type: () => String }, emailAddress: { required: true, type: () => String }, domainSignup: { required: true, type: () => Boolean }, commission: { required: true, type: () => Number }, group: { required: true, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.inviteUser.fullname }),
    __metadata("design:type", String)
], CollegeInvitationDto.prototype, "fullname", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CollegeInvitationDto.prototype, "title", void 0);
__decorate([
    class_validator_1.IsEmail({}, { message: responseMessages_1.default.inviteUser.emailAddress }),
    __metadata("design:type", String)
], CollegeInvitationDto.prototype, "emailAddress", void 0);
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], CollegeInvitationDto.prototype, "domainSignup", void 0);
__decorate([
    validators_1.IsMongoId(false),
    __metadata("design:type", String)
], CollegeInvitationDto.prototype, "group", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CollegeInvitationDto.prototype, "invitedBy", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CollegeInvitationDto.prototype, "collegeId", void 0);
exports.CollegeInvitationDto = CollegeInvitationDto;
//# sourceMappingURL=college-invitation.dto.js.map