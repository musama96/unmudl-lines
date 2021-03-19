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
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
const createPromo_enum_1 = require("../../common/enums/createPromo.enum");
const validators_1 = require("../../common/validators");
class PromoListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: true, type: () => String }, courseKeyword: { required: true, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, noOfUses: { required: true, type: () => Number }, minDiscount: { required: true, type: () => Number }, maxDiscount: { required: true, type: () => Number }, type: { required: false, enum: require("../../common/enums/createPromo.enum").DiscountCut }, applyTo: { required: false, enum: require("../../common/enums/createPromo.enum").ApplyTo }, start: { required: false, type: () => String }, end: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, sortBy: { required: false, type: () => String }, discountType: { required: false, type: () => String }, status: { required: false, type: () => String }, collegeId: { required: false, type: () => String }, courseId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], PromoListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], PromoListDto.prototype, "courseKeyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], PromoListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], PromoListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], PromoListDto.prototype, "noOfUses", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], PromoListDto.prototype, "minDiscount", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], PromoListDto.prototype, "maxDiscount", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(createPromo_enum_1.DiscountCut, { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], PromoListDto.prototype, "type", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(createPromo_enum_1.ApplyTo, { message: responseMessages_1.default.createPromo.applyTo }),
    __metadata("design:type", String)
], PromoListDto.prototype, "applyTo", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], PromoListDto.prototype, "start", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], PromoListDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], PromoListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], PromoListDto.prototype, "courseId", void 0);
exports.PromoListDto = PromoListDto;
//# sourceMappingURL=promoList.dto.js.map