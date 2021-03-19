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
class GiftCourseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { recipientEmail: { required: false, type: () => String }, recipientName: { required: false, type: () => String }, message: { required: true, type: () => String }, courseId: { required: false, type: () => String }, promoId: { required: false, type: () => String }, cardId: { required: false, type: () => String }, deleteCard: { required: false, type: () => Boolean } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsEmail({}, { message: responseMessages_1.default.giftCourse.email }),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "recipientEmail", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.giftCourse.name }),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "recipientName", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.giftCourse.message }),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "message", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "courseId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidPromoId }),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "promoId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "cardId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "recipientId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "senderId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "senderName", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "senderEmail", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "stripeCustomerId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "transactionId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "discountType", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "discountPercentage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "discountTotal", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "salesTax", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "taxPercentage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "totalPaid", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "taxRate", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "totalRevenue", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "unmudlShare", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "unmudlSharePercentage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "collegeShare", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "stripeFee", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "courseFee", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "keptByUnmudl", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Number)
], GiftCourseDto.prototype, "sentToCollege", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "transferId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "destPaymentId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "giftCode", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GiftCourseDto.prototype, "_id", void 0);
exports.GiftCourseDto = GiftCourseDto;
//# sourceMappingURL=giftCourse.dto.js.map