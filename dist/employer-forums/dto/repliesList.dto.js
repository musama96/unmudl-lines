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
class RepliesListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { repliesPerPage: { required: false, type: () => Number }, start: { required: false, type: () => String }, end: { required: false, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '4' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], RepliesListDto.prototype, "repliesPerPage", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], RepliesListDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ default: new Date() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], RepliesListDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
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
exports.RepliesListDto = RepliesListDto;
//# sourceMappingURL=repliesList.dto.js.map