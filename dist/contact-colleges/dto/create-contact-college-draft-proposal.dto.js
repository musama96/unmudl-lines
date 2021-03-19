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
const class_transformer_1 = require("class-transformer");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
const validators_1 = require("../../common/validators");
const responseMessages_1 = require("../../config/responseMessages");
class CreateContactCollegeDraftProposalDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { proposalId: { required: false, type: () => String }, emptyAttachments: { required: false, type: () => Boolean }, title: { required: true, type: () => String }, category: { required: true, type: () => String }, subCategory: { required: true, type: () => String }, description: { required: false, type: () => String }, attachments: { required: true, type: () => Object }, visibility: { required: true, type: () => Object }, colleges: { required: true, type: () => [String] }, locations: { required: true, type: () => [String] }, coordinates: { required: false, type: () => [require("../../common/dto/coordinates.dto").default] } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "proposalId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], CreateContactCollegeDraftProposalDto.prototype, "emptyAttachments", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "category", void 0);
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidSubCategoryId }),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "subCategory", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateContactCollegeDraftProposalDto.prototype, "attachments", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "visibility", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], CreateContactCollegeDraftProposalDto.prototype, "colleges", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], CreateContactCollegeDraftProposalDto.prototype, "locations", void 0);
__decorate([
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], CreateContactCollegeDraftProposalDto.prototype, "coordinates", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "employer", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateContactCollegeDraftProposalDto.prototype, "addedBy", void 0);
exports.CreateContactCollegeDraftProposalDto = CreateContactCollegeDraftProposalDto;
//# sourceMappingURL=create-contact-college-draft-proposal.dto.js.map