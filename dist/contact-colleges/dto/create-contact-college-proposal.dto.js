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
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
class CreateContactCollegeProposalDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { draftProposalId: { required: false, type: () => String }, emptyAttachments: { required: false, type: () => Boolean }, title: { required: true, type: () => String }, category: { required: true, type: () => String }, subCategory: { required: true, type: () => String }, description: { required: false, type: () => String }, attachments: { required: true, type: () => Object }, visibility: { required: true, type: () => Object }, colleges: { required: true, type: () => [String] }, locations: { required: true, type: () => [String] }, showToEmployerAdmins: { required: false, type: () => [String] }, coordinates: { required: false, type: () => [require("../../common/dto/coordinates.dto").default] } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "draftProposalId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Boolean)
], CreateContactCollegeProposalDto.prototype, "emptyAttachments", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createContactCollegeProposal.title }),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "category", void 0);
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidSubCategoryId }),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "subCategory", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createContactCollegeProposal.description }),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateContactCollegeProposalDto.prototype, "attachments", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "visibility", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], CreateContactCollegeProposalDto.prototype, "colleges", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], CreateContactCollegeProposalDto.prototype, "locations", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], CreateContactCollegeProposalDto.prototype, "showToEmployerAdmins", void 0);
__decorate([
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], CreateContactCollegeProposalDto.prototype, "coordinates", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "employer", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateContactCollegeProposalDto.prototype, "addedBy", void 0);
exports.CreateContactCollegeProposalDto = CreateContactCollegeProposalDto;
//# sourceMappingURL=create-contact-college-proposal.dto.js.map