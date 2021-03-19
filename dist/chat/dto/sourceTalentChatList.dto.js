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
const validators_1 = require("../../common/validators");
const class_validator_1 = require("class-validator");
const createSourceTalent_dto_1 = require("../../source-talent/dto/createSourceTalent.dto");
class SourceTalentChatListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => String }, archive: { required: false, type: () => Boolean }, myChatsOnly: { required: false, type: () => Boolean }, type: { required: true, enum: require("../../source-talent/dto/createSourceTalent.dto").SourceTalentType }, sourceTalents: { required: true, type: () => [String] } };
    }
}
__decorate([
    class_validator_1.IsEnum(createSourceTalent_dto_1.SourceTalentType),
    __metadata("design:type", String)
], SourceTalentChatListDto.prototype, "type", void 0);
__decorate([
    class_validator_1.IsArray(),
    validators_1.IsMongoId(true, { each: true }),
    __metadata("design:type", Array)
], SourceTalentChatListDto.prototype, "sourceTalents", void 0);
exports.SourceTalentChatListDto = SourceTalentChatListDto;
//# sourceMappingURL=sourceTalentChatList.dto.js.map