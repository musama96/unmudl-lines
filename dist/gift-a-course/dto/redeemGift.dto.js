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
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
const learnerData_dto_1 = require("../../enrollments/dto/learnerData.dto");
class RedeemGiftDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { giftCode: { required: false, type: () => String }, learnerData: { required: false, type: () => require("../../enrollments/dto/learnerData.dto").LearnerDataDto } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.giftCourse.giftCode }),
    __metadata("design:type", String)
], RedeemGiftDto.prototype, "giftCode", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => learnerData_dto_1.LearnerDataDto),
    __metadata("design:type", learnerData_dto_1.LearnerDataDto)
], RedeemGiftDto.prototype, "learnerData", void 0);
exports.RedeemGiftDto = RedeemGiftDto;
//# sourceMappingURL=redeemGift.dto.js.map