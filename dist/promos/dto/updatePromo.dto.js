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
const duration_dto_1 = require("../../common/dto/duration.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const responseMessages_1 = require("../../config/responseMessages");
const swagger_1 = require("@nestjs/swagger");
const createPromo_enum_1 = require("../../common/enums/createPromo.enum");
const validators_1 = require("../../common/validators");
class UpdatePromoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { _id: { required: true, type: () => String }, title: { required: true, type: () => String }, discount: { required: true, type: () => Number }, discountMetric: { required: true, enum: require("../../common/enums/createPromo.enum").DiscountMetric }, date: { required: true, type: () => require("../../common/dto/duration.dto").DurationDto }, applyTo: { required: false, enum: require("../../common/enums/createPromo.enum").ApplyTo }, type: { required: false, enum: require("../../common/enums/createPromo.enum").DiscountCut }, status: { required: true, enum: require("../../common/enums/createPromo.enum").Status }, courses: { required: false, type: () => [String] }, collegeId: { required: false, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidPromoId }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "_id", void 0);
__decorate([
    class_validator_1.IsString({ message: responseMessages_1.default.createPromo.invalidPromo }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "title", void 0);
__decorate([
    class_validator_1.IsEnum(createPromo_enum_1.DiscountMetric, { message: responseMessages_1.default.createPromo.discountMetric }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "discountMetric", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => duration_dto_1.DurationDto),
    __metadata("design:type", duration_dto_1.DurationDto)
], UpdatePromoDto.prototype, "date", void 0);
__decorate([
    class_validator_1.IsEnum(createPromo_enum_1.ApplyTo, { message: responseMessages_1.default.createPromo.applyTo }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "applyTo", void 0);
__decorate([
    class_validator_1.IsEnum(createPromo_enum_1.DiscountCut, { message: responseMessages_1.default.createPromo.type }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "type", void 0);
__decorate([
    class_validator_1.IsEnum(createPromo_enum_1.Status, { message: responseMessages_1.default.createPromo.status }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "addedBy", void 0);
__decorate([
    validators_1.IsArray(true, { message: responseMessages_1.default.common.invalidCourseIds }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseIds, each: true }),
    __metadata("design:type", Array)
], UpdatePromoDto.prototype, "courses", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], UpdatePromoDto.prototype, "collegeId", void 0);
exports.UpdatePromoDto = UpdatePromoDto;
//# sourceMappingURL=updatePromo.dto.js.map