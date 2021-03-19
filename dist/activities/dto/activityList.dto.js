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
const validators_1 = require("../../common/validators");
var ActivityType;
(function (ActivityType) {
    ActivityType["USER"] = "user";
    ActivityType["TRANSACTION"] = "transaction";
})(ActivityType || (ActivityType = {}));
var Duration;
(function (Duration) {
    Duration[Duration["TODAY"] = 1] = "TODAY";
    Duration[Duration["WEEK"] = 7] = "WEEK";
    Duration[Duration["MONTH"] = 30] = "MONTH";
})(Duration || (Duration = {}));
class ActivityListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, enum: ActivityType }, start: { required: false, type: () => String }, end: { required: false, type: () => String }, userId: { required: false, type: () => String }, learnerId: { required: false, type: () => String }, courseId: { required: false, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number } };
    }
}
__decorate([
    class_validator_1.IsEnum(ActivityType, { message: responseMessages_1.default.activities.type }),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], ActivityListDto.prototype, "type", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], ActivityListDto.prototype, "start", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], ActivityListDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidUserId }),
    __metadata("design:type", String)
], ActivityListDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidLearnerId }),
    __metadata("design:type", String)
], ActivityListDto.prototype, "learnerId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidLearnerId }),
    __metadata("design:type", String)
], ActivityListDto.prototype, "courseId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], ActivityListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], ActivityListDto.prototype, "perPage", void 0);
exports.ActivityListDto = ActivityListDto;
//# sourceMappingURL=activityList.dto.js.map