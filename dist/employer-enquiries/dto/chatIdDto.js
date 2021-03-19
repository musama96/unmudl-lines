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
const swagger_1 = require("@nestjs/swagger");
const validators_1 = require("../../common/validators");
class ChatIdDto {
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false),
    __metadata("design:type", String)
], ChatIdDto.prototype, "chatId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ChatIdDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Object)
], ChatIdDto.prototype, "user", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ChatIdDto.prototype, "employerAdminId", void 0);
exports.ChatIdDto = ChatIdDto;
//# sourceMappingURL=chatIdDto.js.map