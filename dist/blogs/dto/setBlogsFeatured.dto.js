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
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
var FeaturedStatus;
(function (FeaturedStatus) {
    FeaturedStatus["FEATURE"] = "feature";
    FeaturedStatus["UNFEATURE"] = "unfeature";
})(FeaturedStatus = exports.FeaturedStatus || (exports.FeaturedStatus = {}));
class SetBlogsFeaturedDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { blogId: { required: true, type: () => String }, status: { required: true, enum: require("./setBlogsFeatured.dto").FeaturedStatus } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidBlogId }),
    __metadata("design:type", String)
], SetBlogsFeaturedDto.prototype, "blogId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(FeaturedStatus, { message: 'Select either feature or unfeature.' }),
    __metadata("design:type", String)
], SetBlogsFeaturedDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Object)
], SetBlogsFeaturedDto.prototype, "update", void 0);
exports.SetBlogsFeaturedDto = SetBlogsFeaturedDto;
//# sourceMappingURL=setBlogsFeatured.dto.js.map