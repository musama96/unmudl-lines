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
const responseMessages_1 = require("../../config/responseMessages");
const class_validator_1 = require("class-validator");
const validators_1 = require("../../common/validators");
class SetEnrollmentCancelledStatusDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { courseId: { required: true, type: () => String }, status: { required: true, type: () => Boolean } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.setEnrollment.courseId }),
    __metadata("design:type", String)
], SetEnrollmentCancelledStatusDto.prototype, "courseId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsBoolean({ message: responseMessages_1.default.setEnrollment.status }),
    __metadata("design:type", Boolean)
], SetEnrollmentCancelledStatusDto.prototype, "status", void 0);
exports.SetEnrollmentCancelledStatusDto = SetEnrollmentCancelledStatusDto;
//# sourceMappingURL=setEnrollmentCancelledStatus.dto.js.map