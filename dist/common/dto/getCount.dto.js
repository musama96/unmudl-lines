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
class GetCountDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { start: { required: false, type: () => String }, end: { required: false, type: () => String }, interval: { required: false, type: () => Number }, collegeId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: new Date().toISOString() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], GetCountDto.prototype, "start", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: new Date().toISOString() }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], GetCountDto.prototype, "end", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'Valid options: 1, 30 or 365' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetCountDto.prototype, "interval", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], GetCountDto.prototype, "collegeId", void 0);
exports.GetCountDto = GetCountDto;
//# sourceMappingURL=getCount.dto.js.map