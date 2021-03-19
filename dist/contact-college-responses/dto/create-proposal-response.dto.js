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
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
class CreateProposalResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { users: { required: false, type: () => [String] }, proposal: { required: false, type: () => String }, description: { required: false, type: () => String }, attachments: { required: false, type: () => Object } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsArray(false, { message: responseMessages_1.default.common.invalidUserIds }),
    validators_1.IsMongoId(true, { each: true, message: responseMessages_1.default.common.invalidUserIds }),
    __metadata("design:type", Array)
], CreateProposalResponseDto.prototype, "users", void 0);
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidContactCollegeProposalId }),
    __metadata("design:type", String)
], CreateProposalResponseDto.prototype, "proposal", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateProposalResponseDto.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateProposalResponseDto.prototype, "attachments", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateProposalResponseDto.prototype, "college", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateProposalResponseDto.prototype, "appliedBy", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateProposalResponseDto.prototype, "proposedBy", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateProposalResponseDto.prototype, "chat", void 0);
exports.CreateProposalResponseDto = CreateProposalResponseDto;
//# sourceMappingURL=create-proposal-response.dto.js.map