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
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const state_dto_1 = require("../../common/dto/state.dto");
const validators_1 = require("../../common/validators");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
const responseMessages_1 = require("../../config/responseMessages");
const url_dto_1 = require("./url.dto");
class SignUpEmployerDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { token: { required: false, type: () => String }, profilePhoto: { required: false, type: () => Object }, employerBanner: { required: false, type: () => Object }, employerLogo: { required: false, type: () => Object }, fullname: { required: true, type: () => String }, password: { required: true, type: () => String }, designation: { required: true, type: () => String }, size: { required: true, type: () => Number }, industry: { required: false, type: () => [String] }, description: { required: false, type: () => String }, coordinates: { required: false, type: () => require("../../common/dto/coordinates.dto").default }, url: { required: false, type: () => require("./url.dto").default }, title: { required: true, type: () => String }, address: { required: false, type: () => String }, city: { required: false, type: () => String }, state: { required: false, type: () => require("../../common/dto/state.dto").StateDto }, zip: { required: false, type: () => String }, country: { required: false, type: () => String }, timezone: { required: false, type: () => String }, industries: { required: false, type: () => [String] } };
    }
}
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "_id", void 0);
__decorate([
    swagger_1.ApiProperty({ required: true }),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.common.requiredToken }),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "token", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], SignUpEmployerDto.prototype, "profilePhoto", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "profilePhotoThumbnail", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], SignUpEmployerDto.prototype, "employerBanner", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], SignUpEmployerDto.prototype, "employerLogo", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Object)
], SignUpEmployerDto.prototype, "employerLogoThumbnail", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "employerId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "invitation", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createCollege.fullname }),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "fullname", void 0);
__decorate([
    swagger_1.ApiProperty({ format: 'password' }),
    class_validator_1.Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages_1.default.createCollege.invalidPassword }),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "password", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "role", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", Number)
], SignUpEmployerDto.prototype, "size", void 0);
__decorate([
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsNotEmpty({ each: true }),
    __metadata("design:type", Array)
], SignUpEmployerDto.prototype, "industry", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", coordinates_dto_1.default)
], SignUpEmployerDto.prototype, "coordinates", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => url_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", url_dto_1.default)
], SignUpEmployerDto.prototype, "url", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "title", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], SignUpEmployerDto.prototype, "state", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], SignUpEmployerDto.prototype, "zip", void 0);
exports.SignUpEmployerDto = SignUpEmployerDto;
//# sourceMappingURL=sign-up-employer.dto.js.map