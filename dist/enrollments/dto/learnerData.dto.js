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
const responseMessages_1 = require("../../config/responseMessages");
const class_transformer_1 = require("class-transformer");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
const state_dto_1 = require("../../common/dto/state.dto");
const learner_model_1 = require("../../learners/learner.model");
class LearnerDataDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { firstname: { required: false, type: () => String }, lastname: { required: false, type: () => String }, emailAddress: { required: false, type: () => String }, phoneNumber: { required: false, type: () => String }, address: { required: false, type: () => String }, dateOfBirth: { required: false, type: () => String }, hasStudentId: { required: false, type: () => Boolean }, studentId: { required: false, type: () => String }, coordinates: { required: false, type: () => require("../../common/dto/coordinates.dto").default }, city: { required: false, type: () => String }, state: { required: false, type: () => require("../../common/dto/state.dto").StateDto }, country: { required: false, type: () => String }, zip: { required: false, type: () => String }, gender: { required: false, enum: require("../../learners/learner.model").Gender }, veteranBenefits: { required: false, type: () => Boolean }, militaryStatus: { required: false, enum: require("../../learners/learner.model").MilitaryStatus }, isSpouseActive: { required: false, type: () => Boolean }, militaryBenefit: { required: false, enum: require("../../learners/learner.model").MilitaryBenefit }, wioaBenefits: { required: false, type: () => Boolean } };
    }
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "firstname", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "lastname", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "emailAddress", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "phoneNumber", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "address", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.Matches(/((0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-[12]\d{3})/, { message: responseMessages_1.default.common.invalidDateOfBirth }),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "dateOfBirth", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], LearnerDataDto.prototype, "hasStudentId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "studentId", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", coordinates_dto_1.default)
], LearnerDataDto.prototype, "coordinates", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "city", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], LearnerDataDto.prototype, "state", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "country", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "zip", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "fullname", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.Gender),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "gender", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.MilitaryStatus),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "militaryStatus", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.MilitaryBenefit),
    __metadata("design:type", String)
], LearnerDataDto.prototype, "militaryBenefit", void 0);
exports.LearnerDataDto = LearnerDataDto;
//# sourceMappingURL=learnerData.dto.js.map