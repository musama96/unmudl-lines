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
const class_transformer_1 = require("class-transformer");
const duration_dto_1 = require("../../common/dto/duration.dto");
const swagger_1 = require("@nestjs/swagger");
const validators_1 = require("../../common/validators");
class GetListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: true, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, type: { required: false, type: () => String }, status: { required: false, type: () => String }, date: { required: true, type: () => require("../../common/dto/duration.dto").DurationDto }, collegeId: { required: false, type: () => String }, courseId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], GetListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetListDto.prototype, "perPage", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsIn(['unmudl', 'college'], { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], GetListDto.prototype, "type", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsIn(['active', 'suspended'], { message: responseMessages_1.default.createPromo.status }),
    __metadata("design:type", String)
], GetListDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => duration_dto_1.DurationDto),
    __metadata("design:type", duration_dto_1.DurationDto)
], GetListDto.prototype, "date", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], GetListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], GetListDto.prototype, "courseId", void 0);
exports.GetListDto = GetListDto;
//# sourceMappingURL=getList.dto.js.map