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
class AdminHomeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { graphStart: { required: true, type: () => String }, graphEnd: { required: true, type: () => String }, interval: { required: true, type: () => Number }, statsStart: { required: true, type: () => String }, statsEnd: { required: true, type: () => String }, perPage: { required: false, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], AdminHomeDto.prototype, "graphStart", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], AdminHomeDto.prototype, "graphEnd", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Number)
], AdminHomeDto.prototype, "interval", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], AdminHomeDto.prototype, "statsStart", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], AdminHomeDto.prototype, "statsEnd", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], AdminHomeDto.prototype, "perPage", void 0);
exports.default = AdminHomeDto;
//# sourceMappingURL=adminHomeDto.dto.js.map