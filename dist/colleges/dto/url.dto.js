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
class UrlDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { website: { required: false, type: () => String }, facebook: { required: false, type: () => String }, twitter: { required: false, type: () => String }, linkedIn: { required: false, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsUrl({}, { message: responseMessages_1.default.url.invalidWebsiteUrl }),
    __metadata("design:type", String)
], UrlDto.prototype, "website", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsUrl({}, { message: responseMessages_1.default.url.invalidFacebookUrl }),
    __metadata("design:type", String)
], UrlDto.prototype, "facebook", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsUrl({}, { message: responseMessages_1.default.url.invalidTwitterUrl }),
    __metadata("design:type", String)
], UrlDto.prototype, "twitter", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsUrl({}, { message: responseMessages_1.default.url.invalidLinkedInUrl }),
    __metadata("design:type", String)
], UrlDto.prototype, "linkedIn", void 0);
exports.default = UrlDto;
//# sourceMappingURL=url.dto.js.map