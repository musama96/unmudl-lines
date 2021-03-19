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
class RepliesListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { numId: { required: true, type: () => Number }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, recentRepliesPerPage: { required: true, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty({ description: 'numId of post' }),
    __metadata("design:type", Number)
], RepliesListDto.prototype, "numId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    swagger_1.ApiHideProperty(),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.post.postId }),
    __metadata("design:type", String)
], RepliesListDto.prototype, "postId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], RepliesListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '4' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], RepliesListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '4' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], RepliesListDto.prototype, "recentRepliesPerPage", void 0);
exports.RepliesListDto = RepliesListDto;
//# sourceMappingURL=repliesList.dto.js.map