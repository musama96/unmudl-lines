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
const swagger_1 = require("@nestjs/swagger");
const validators_1 = require("../../common/validators");
class AddMembersDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { chatId: { required: true, type: () => String }, members: { required: true, type: () => [String] } };
    }
}
__decorate([
    validators_1.IsMongoId(false),
    __metadata("design:type", String)
], AddMembersDto.prototype, "chatId", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String }),
    validators_1.IsArray(false),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidUserId, each: true }),
    __metadata("design:type", Array)
], AddMembersDto.prototype, "members", void 0);
exports.AddMembersDto = AddMembersDto;
//# sourceMappingURL=addMembers.dto.js.map