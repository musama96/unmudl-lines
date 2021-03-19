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
const validators_1 = require("../../common/validators");
var PartnerRequestStatus;
(function (PartnerRequestStatus) {
    PartnerRequestStatus["PENDING"] = "pending";
    PartnerRequestStatus["APPROVED"] = "approved";
    PartnerRequestStatus["REJECTED"] = "rejected";
})(PartnerRequestStatus = exports.PartnerRequestStatus || (exports.PartnerRequestStatus = {}));
class UpdatePartnerRequestStatusDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { partnerRequestId: { required: true, type: () => String }, status: { required: true, enum: require("./updatePartnerRequestStatus.dto").PartnerRequestStatus } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.partnerRequestId }),
    __metadata("design:type", String)
], UpdatePartnerRequestStatusDto.prototype, "partnerRequestId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(PartnerRequestStatus, { message: responseMessages_1.default.updatePartnerRequestStatus.status }),
    __metadata("design:type", String)
], UpdatePartnerRequestStatusDto.prototype, "status", void 0);
exports.UpdatePartnerRequestStatusDto = UpdatePartnerRequestStatusDto;
//# sourceMappingURL=updatePartnerRequestStatus.dto.js.map