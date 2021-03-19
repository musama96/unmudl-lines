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
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
class UpdateLearnerEnrollmentActivityDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => String }, userId: { required: false, type: () => String }, courseId: { required: false, type: () => String }, averageScore: { required: false, type: () => String }, totalTimeSpentInMinutes: { required: false, type: () => String }, startedDate: { required: false, type: () => String }, completedDate: { required: false, type: () => String }, certificateNumber: { required: false, type: () => String }, certificateURL: { required: false, type: () => String }, total: { required: false, type: () => Number }, started: { required: false, type: () => Number }, completed: { required: false, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsIn(['not-started', 'in-progress', 'completed'], { message: responseMessages_1.default.updateLearnerEnrollmentActivity.status }),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.updateLearnerEnrollmentActivity.userId }),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.updateLearnerEnrollmentActivity.courseId }),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "courseId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "averageScore", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "totalTimeSpentInMinutes", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "startedDate", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "completedDate", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "certificateNumber", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], UpdateLearnerEnrollmentActivityDto.prototype, "certificateURL", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UpdateLearnerEnrollmentActivityDto.prototype, "total", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UpdateLearnerEnrollmentActivityDto.prototype, "started", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], UpdateLearnerEnrollmentActivityDto.prototype, "completed", void 0);
exports.UpdateLearnerEnrollmentActivityDto = UpdateLearnerEnrollmentActivityDto;
//# sourceMappingURL=updateLearnerEnrollmentActivity.dto.js.map