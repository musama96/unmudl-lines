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
var EmployerRequestStatus;
(function (EmployerRequestStatus) {
    EmployerRequestStatus["PENDING"] = "pending";
    EmployerRequestStatus["APPROVED"] = "approved";
    EmployerRequestStatus["REJECTED"] = "rejected";
})(EmployerRequestStatus = exports.EmployerRequestStatus || (exports.EmployerRequestStatus = {}));
class UpdateEmployerRequestStatusDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { employerRequestId: { required: true, type: () => String }, status: { required: true, enum: require("./updateEmployerRequestStatus.dto").EmployerRequestStatus } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.partnerRequestId }),
    __metadata("design:type", String)
], UpdateEmployerRequestStatusDto.prototype, "employerRequestId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(EmployerRequestStatus, { message: responseMessages_1.default.updatePartnerRequestStatus.status }),
    __metadata("design:type", String)
], UpdateEmployerRequestStatusDto.prototype, "status", void 0);
exports.UpdateEmployerRequestStatusDto = UpdateEmployerRequestStatusDto;
//# sourceMappingURL=updateEmployerRequestStatus.dto.js.map