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
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const chatList_dto_1 = require("./chatList.dto");
class AddChatDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { groupName: { required: false, type: () => String }, course: { required: false, type: () => String }, college: { required: false, type: () => String }, employer: { required: false, type: () => String }, learner: { required: false, type: () => String }, users: { required: false, type: () => [String] }, employerAdmins: { required: false, type: () => [String] }, module: { required: false, enum: require("./chatList.dto").ChatModuleEnum }, moduleDocumentId: { required: false, type: () => String }, type: { required: false, enum: require("../chat.model").ChatType } };
    }
}
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], AddChatDto.prototype, "course", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], AddChatDto.prototype, "college", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidEmployerId }),
    __metadata("design:type", String)
], AddChatDto.prototype, "employer", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidLearnerIds }),
    __metadata("design:type", String)
], AddChatDto.prototype, "learner", void 0);
__decorate([
    validators_1.IsArray(true, { message: responseMessages_1.default.common.invalidUserIds }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidUserIds, each: true }),
    __metadata("design:type", Array)
], AddChatDto.prototype, "users", void 0);
__decorate([
    validators_1.IsArray(true, { message: responseMessages_1.default.common.invalidEmployerAdminIds }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidEmployerAdminIds, each: true }),
    __metadata("design:type", Array)
], AddChatDto.prototype, "employerAdmins", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(chatList_dto_1.ChatModuleEnum, { message: responseMessages_1.default.addChat.module }),
    __metadata("design:type", String)
], AddChatDto.prototype, "module", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.addChat.moduleDocumentId }),
    __metadata("design:type", String)
], AddChatDto.prototype, "moduleDocumentId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], AddChatDto.prototype, "createdBy", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], AddChatDto.prototype, "createdByType", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", Boolean)
], AddChatDto.prototype, "showToCreator", void 0);
exports.AddChatDto = AddChatDto;
//# sourceMappingURL=addChat.dto.js.map