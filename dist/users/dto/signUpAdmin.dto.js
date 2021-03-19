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
const validators_1 = require("../../common/validators");
class SignUpAdminDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fullname: { required: true, type: () => String }, emailAddress: { required: true, type: () => String }, username: { required: false, type: () => String }, password: { required: true, type: () => String }, role: { required: false, type: () => String }, collegeId: { required: false, type: () => String }, designation: { required: true, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "fullname", void 0);
__decorate([
    class_validator_1.IsEmail(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "emailAddress", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "username", void 0);
__decorate([
    class_validator_1.Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages_1.default.createUser.invalidPassword }),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "password", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "role", void 0);
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "collegeId", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpAdminDto.prototype, "designation", void 0);
exports.SignUpAdminDto = SignUpAdminDto;
//# sourceMappingURL=signUpAdmin.dto.js.map