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
const class_transformer_1 = require("class-transformer");
const learnerData_dto_1 = require("./learnerData.dto");
const validators_1 = require("../../common/validators");
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["PENDING"] = "pending";
    EnrollmentStatus["APPROVED"] = "approved";
    EnrollmentStatus["PROCESSED"] = "processed";
    EnrollmentStatus["DECLINED"] = "declined";
    EnrollmentStatus["CANCELED"] = "canceled";
    EnrollmentStatus["REFUNDED"] = "refunded";
})(EnrollmentStatus = exports.EnrollmentStatus || (exports.EnrollmentStatus = {}));
class CreateEnrollmentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { courseId: { required: true, type: () => String }, cardId: { required: false, type: () => String }, deleteCard: { required: false, type: () => Boolean }, learnerData: { required: false, type: () => require("./learnerData.dto").LearnerDataDto }, promoId: { required: false, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "courseId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.createEnrollment.stripeCustomerId }),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "cardId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "transferId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "destPaymentId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => learnerData_dto_1.LearnerDataDto),
    __metadata("design:type", learnerData_dto_1.LearnerDataDto)
], CreateEnrollmentDto.prototype, "learnerData", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidPromoId }),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "promoId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "learnerId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "learnerName", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "transactionId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "stripeCustomerId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "discountType", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "discountPercentage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "discountTotal", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "salesTax", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "taxPercentage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "totalPaid", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "taxRate", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "totalRevenue", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "unmudlShare", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "unmudlSharePercentage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "collegeShare", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "stripeFee", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "courseFee", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "keptByUnmudl", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], CreateEnrollmentDto.prototype, "sentToCollege", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "status", void 0);
exports.CreateEnrollmentDto = CreateEnrollmentDto;
//# sourceMappingURL=createEnrollment.dto.js.map