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
const contact_dto_1 = require("./contact.dto");
const swagger_1 = require("@nestjs/swagger");
class UpdateCollegeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { collegeLogo: { required: false, type: () => Object }, collegeLogoPath: { required: false, type: () => String }, collegeBanner: { required: false, type: () => Object }, collegeBannerPath: { required: false, type: () => String }, description: { required: false, type: () => String }, communityCollegeId: { required: false, type: () => String }, title: { required: false, type: () => String }, address: { required: false, type: () => String }, streetAddress: { required: false, type: () => String }, city: { required: false, type: () => String }, zip: { required: false, type: () => String }, timeZone: { required: false, type: () => String }, country: { required: false, type: () => String }, url: { required: false, type: () => require("./url.dto").default }, contact: { required: false, type: () => require("./contact.dto").default } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateCollegeDto.prototype, "collegeLogo", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "collegeLogoPath", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateCollegeDto.prototype, "collegeBanner", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "collegeBannerPath", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "collegeLogoThumbnail", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "_id", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "title", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "address", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "streetAddress", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    __metadata("design:type", String)
], UpdateCollegeDto.prototype, "timeZone", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => url_dto_1.default),
    __metadata("design:type", url_dto_1.default)
], UpdateCollegeDto.prototype, "url", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => contact_dto_1.default),
    __metadata("design:type", contact_dto_1.default)
], UpdateCollegeDto.prototype, "contact", void 0);
exports.UpdateCollegeDto = UpdateCollegeDto;
//# sourceMappingURL=updateCollege.dto.js.map