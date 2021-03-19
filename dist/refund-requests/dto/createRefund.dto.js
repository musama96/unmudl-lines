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
const createRefund_enum_1 = require("../../common/enums/createRefund.enum");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
const refund_request_model_1 = require("../refund-request.model");
const validators_1 = require("../../common/validators");
class CreateRefundDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { enrollmentId: { required: true, type: () => String }, reason: { required: true, enum: require("../refund-request.model").RefundRequestReason, isArray: true }, otherInfo: { required: false, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.createRefund.enrollmentId }),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "enrollmentId", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["duplicate", "unintentional"]' }),
    validators_1.IsArray(false),
    class_validator_1.ArrayMinSize(1, { message: responseMessages_1.default.createRefund.noReasonSelected }),
    class_validator_1.IsEnum(refund_request_model_1.RefundRequestReason, { each: true, message: responseMessages_1.default.createRefund.reason }),
    __metadata("design:type", Array)
], CreateRefundDto.prototype, "reason", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "otherInfo", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "transactionId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "requestedBy", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateRefundDto.prototype, "courseId", void 0);
exports.CreateRefundDto = CreateRefundDto;
//# sourceMappingURL=createRefund.dto.js.map