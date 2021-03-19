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
class EditReplyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { content: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Object)
], EditReplyDto.prototype, "replyId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Object)
], EditReplyDto.prototype, "user", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Object)
], EditReplyDto.prototype, "employerAdmin", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EditReplyDto.prototype, "content", void 0);
exports.EditReplyDto = EditReplyDto;
//# sourceMappingURL=editReply.dto.js.map