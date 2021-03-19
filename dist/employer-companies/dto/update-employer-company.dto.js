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
const url_dto_1 = require("./url.dto");
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
class UpdateEmployerCompanyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { employerLogo: { required: false, type: () => Object }, employerLogoPath: { required: false, type: () => String }, employerBanner: { required: false, type: () => Object }, employerBannerPath: { required: false, type: () => String }, description: { required: false, type: () => String }, _id: { required: false, type: () => String }, title: { required: false, type: () => String }, address: { required: false, type: () => String }, city: { required: false, type: () => String }, zip: { required: false, type: () => String }, country: { required: false, type: () => String }, url: { required: false, type: () => require("./url.dto").default }, industries: { required: false, type: () => [String] }, employerGroup: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateEmployerCompanyDto.prototype, "employerLogo", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateEmployerCompanyDto.prototype, "employerLogoPath", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateEmployerCompanyDto.prototype, "employerBanner", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateEmployerCompanyDto.prototype, "employerBannerPath", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateEmployerCompanyDto.prototype, "employerLogoThumbnail", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidEmployerId }),
    __metadata("design:type", String)
], UpdateEmployerCompanyDto.prototype, "_id", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UpdateEmployerCompanyDto.prototype, "title", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => url_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", url_dto_1.default)
], UpdateEmployerCompanyDto.prototype, "url", void 0);
__decorate([
    validators_1.IsMongoId(true),
    __metadata("design:type", String)
], UpdateEmployerCompanyDto.prototype, "employerGroup", void 0);
exports.UpdateEmployerCompanyDto = UpdateEmployerCompanyDto;
//# sourceMappingURL=update-employer-company.dto.js.map