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
const dateRange_validator_1 = require("../validators/dateRange.validator");
class IntervalDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { start: { required: true, type: () => String }, end: { required: true, type: () => String }, interval: { required: true, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty({ example: '2020-06-06T07:00:22.177+00:00' }),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], IntervalDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ example: '2020-09-06T07:00:22.177+00:00' }),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    dateRange_validator_1.IsGreaterThanStart('start', { message: responseMessages_1.default.common.endDate }),
    __metadata("design:type", String)
], IntervalDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ example: 1 }),
    class_validator_1.IsIn([1, 7, 30, 365], { message: responseMessages_1.default.common.invalidInterval }),
    __metadata("design:type", Number)
], IntervalDto.prototype, "interval", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], IntervalDto.prototype, "collegeId", void 0);
exports.IntervalDto = IntervalDto;
//# sourceMappingURL=interval.dto.js.map