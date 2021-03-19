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
const validators_1 = require("../../common/validators");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
const createSourceTalent_dto_1 = require("./createSourceTalent.dto");
class SourceTalentListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, employerId: { required: false, type: () => String }, type: { required: false, enum: require("./createSourceTalent.dto").SourceTalentType } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], SourceTalentListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], SourceTalentListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], SourceTalentListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: 'createdAt' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], SourceTalentListDto.prototype, "sortBy", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '-1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], SourceTalentListDto.prototype, "sortOrder", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidEmployerId }),
    __metadata("design:type", String)
], SourceTalentListDto.prototype, "employerId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(createSourceTalent_dto_1.SourceTalentType, { message: responseMessages_1.default.createSourceTalent.type }),
    __metadata("design:type", String)
], SourceTalentListDto.prototype, "type", void 0);
exports.SourceTalentListDto = SourceTalentListDto;
//# sourceMappingURL=sourceTalentList.dto.js.map