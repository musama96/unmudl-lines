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
const validators_1 = require("../../common/validators");
class GetMessagesDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { chatId: { required: true, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false),
    __metadata("design:type", String)
], GetMessagesDto.prototype, "chatId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetMessagesDto.prototype, "page", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], GetMessagesDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], GetMessagesDto.prototype, "userId", void 0);
exports.GetMessagesDto = GetMessagesDto;
//# sourceMappingURL=getMessages.dto.js.map