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
class UpdateLandingPageDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { cover: { required: false, type: () => Object }, altTag: { required: false, type: () => String }, pictureCredits: { required: false, type: () => String }, hyperlink: { required: false, type: () => String }, title: { required: true, type: () => String }, tagLine: { required: true, type: () => String }, tagLineHyperlink: { required: false, type: () => String }, titleColor: { required: true, type: () => String }, subtitleColor: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], UpdateLandingPageDto.prototype, "cover", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "altTag", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "pictureCredits", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsUrl(),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "hyperlink", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.updateLanding.title }),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "title", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.updateLanding.tagLine }),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "tagLine", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "tagLineHyperlink", void 0);
__decorate([
    class_validator_1.MinLength(6, { message: 'titleColor must be a hex color code.' }),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "titleColor", void 0);
__decorate([
    class_validator_1.MinLength(6, { message: 'subtitleColor must be a hex color code.' }),
    __metadata("design:type", String)
], UpdateLandingPageDto.prototype, "subtitleColor", void 0);
exports.UpdateLandingPageDto = UpdateLandingPageDto;
//# sourceMappingURL=updateLandingPage.dto.js.map