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
class UpdateBasicDetailsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fullname: { required: true, type: () => String }, emailAddress: { required: true, type: () => String }, designation: { required: true, type: () => String }, profilePhoto: { required: false, type: () => Object }, profilePhotoPath: { required: false, type: () => String }, bio: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsString({ message: responseMessages_1.default.createUser.invalidFullName }),
    __metadata("design:type", String)
], UpdateBasicDetailsDto.prototype, "fullname", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsEmail({}, { message: responseMessages_1.default.createUser.invalidEmail }),
    __metadata("design:type", String)
], UpdateBasicDetailsDto.prototype, "emailAddress", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsString({ message: responseMessages_1.default.createUser.invalidDesignation }),
    __metadata("design:type", String)
], UpdateBasicDetailsDto.prototype, "designation", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateBasicDetailsDto.prototype, "profilePhoto", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateBasicDetailsDto.prototype, "profilePhotoPath", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateBasicDetailsDto.prototype, "profilePhotoThumbnail", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateBasicDetailsDto.prototype, "bio", void 0);
exports.UpdateBasicDetailsDto = UpdateBasicDetailsDto;
//# sourceMappingURL=updateBasicDetails.dto.js.map