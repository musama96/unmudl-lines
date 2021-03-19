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
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AddChatReplyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { chat: { required: false, type: () => String }, message: { required: false, type: () => String }, title: { required: false, type: () => String }, attachments: { required: false, type: () => Object }, showToCreator: { required: false, type: () => Boolean } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: true }),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidEnquiryId }),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "chat", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "message", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], AddChatReplyDto.prototype, "attachments", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean({ message: responseMessages_1.default.addChat.showToCreator }),
    __metadata("design:type", Boolean)
], AddChatReplyDto.prototype, "showToCreator", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "employerAdmin", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "learner", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "user", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Boolean)
], AddChatReplyDto.prototype, "readByLearner", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Array)
], AddChatReplyDto.prototype, "readByUsers", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Array)
], AddChatReplyDto.prototype, "readByEmployerAdmins", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], AddChatReplyDto.prototype, "_id", void 0);
exports.AddChatReplyDto = AddChatReplyDto;
//# sourceMappingURL=addReply.dto.js.map