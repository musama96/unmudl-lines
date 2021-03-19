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
var EmployerRequestsColumn;
(function (EmployerRequestsColumn) {
    EmployerRequestsColumn["ContactPerson"] = "contactPerson";
    EmployerRequestsColumn["EmployerName"] = "employerName";
    EmployerRequestsColumn["Email"] = "email";
    EmployerRequestsColumn["PhoneNumber"] = "phoneNumber";
    EmployerRequestsColumn["Status"] = "status";
})(EmployerRequestsColumn || (EmployerRequestsColumn = {}));
class EmployerRequestListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], EmployerRequestListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], EmployerRequestListDto.prototype, "perPage", void 0);
exports.EmployerRequestListDto = EmployerRequestListDto;
//# sourceMappingURL=employerRequestList.dto.js.map