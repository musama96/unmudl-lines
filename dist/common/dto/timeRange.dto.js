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
const validators_1 = require("../../common/validators");
const timeRange_validator_1 = require("../validators/timeRange.validator");
const responseMessages_1 = require("../../config/responseMessages");
const swagger_1 = require("@nestjs/swagger");
var HoursOffered;
(function (HoursOffered) {
    HoursOffered["DAYTIME"] = "daytime";
    HoursOffered["EVENING"] = "evening";
})(HoursOffered || (HoursOffered = {}));
class TimeRangeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { hoursOffered: { required: true, enum: HoursOffered }, start: { required: false, type: () => String }, end: { required: false, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsEnum(HoursOffered),
    __metadata("design:type", String)
], TimeRangeDto.prototype, "hoursOffered", void 0);
__decorate([
    swagger_1.ApiProperty({ example: '5:17 PM' }),
    validators_1.IsTimeString({ message: responseMessages_1.default.common.time }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], TimeRangeDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ example: '9:17 PM' }),
    validators_1.IsTimeString({ message: responseMessages_1.default.common.time }),
    timeRange_validator_1.IsGreaterThanStart('start', { message: responseMessages_1.default.common.endTime }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], TimeRangeDto.prototype, "end", void 0);
exports.TimeRangeDto = TimeRangeDto;
//# sourceMappingURL=timeRange.dto.js.map