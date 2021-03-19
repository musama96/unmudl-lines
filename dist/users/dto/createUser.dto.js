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
const contactInfo_dto_1 = require("./contactInfo.dto");
const class_transformer_1 = require("class-transformer");
const state_dto_1 = require("../../common/dto/state.dto");
var Role;
(function (Role) {
    Role["ADMIN"] = "admin";
    Role["MODERATOR"] = "moderator";
    Role["INSTRUCTOR"] = "instructor";
    Role["MANAGER"] = "manager";
})(Role = exports.Role || (exports.Role = {}));
class CreateUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { token: { required: false, type: () => String }, fullname: { required: true, type: () => String }, password: { required: true, type: () => String }, contact: { required: false, type: () => require("./contactInfo.dto").ContactInfoDto }, city: { required: true, type: () => String }, state: { required: true, type: () => require("../../common/dto/state.dto").StateDto }, zip: { required: true, type: () => String }, profilePhoto: { required: false, type: () => Object }, bio: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: true }),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.common.requiredToken }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "token", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "fullname", void 0);
__decorate([
    class_validator_1.Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages_1.default.updateUser.invalidPassword }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "userId", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_validator_1.IsOptional(),
    class_transformer_1.Type(() => contactInfo_dto_1.ContactInfoDto),
    __metadata("design:type", contactInfo_dto_1.ContactInfoDto)
], CreateUserDto.prototype, "contact", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Only for unmudl admin' }),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "city", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Only for unmudl admin' }),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], CreateUserDto.prototype, "state", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Only for unmudl admin' }),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "zip", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "profilePhoto", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "profilePhotoThumbnail", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "joinDate", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "bio", void 0);
exports.CreateUserDto = CreateUserDto;
//# sourceMappingURL=createUser.dto.js.map