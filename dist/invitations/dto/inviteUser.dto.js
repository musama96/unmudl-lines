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
const user_model_1 = require("../../users/user.model");
const validators_1 = require("../../common/validators");
var Role;
(function (Role) {
    Role["ADMIN"] = "admin";
    Role["MODERATOR"] = "moderator";
    Role["INSTRUCTOR"] = "instructor";
    Role["MANAGER"] = "manager";
    Role["SUPERADMIN"] = "superdamin";
})(Role = exports.Role || (exports.Role = {}));
class InviteUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fullname: { required: true, type: () => String }, emailAddress: { required: true, type: () => String }, role: { required: true, enum: require("../../users/user.model").UserRoles }, courseId: { required: false, type: () => String }, collegeId: { required: false, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.inviteUser.fullname }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "fullname", void 0);
__decorate([
    class_validator_1.IsEmail({}, { message: responseMessages_1.default.inviteUser.emailAddress }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "emailAddress", void 0);
__decorate([
    class_validator_1.IsEnum(user_model_1.UserRoles, { message: responseMessages_1.default.inviteUser.role }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "role", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "courseId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], InviteUserDto.prototype, "invitedBy", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], InviteUserDto.prototype, "collegeId", void 0);
exports.InviteUserDto = InviteUserDto;
//# sourceMappingURL=inviteUser.dto.js.map