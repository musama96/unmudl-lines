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
const learner_model_1 = require("../learner.model");
const responseMessages_1 = require("../../config/responseMessages");
class EditPersonalInformationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { firstname: { required: true, type: () => String }, lastname: { required: true, type: () => String }, ethnicity: { required: false, enum: require("../learner.model").Ethnicity }, gender: { required: false, enum: require("../learner.model").Gender }, phoneNumber: { required: false, type: () => String }, emailAddress: { required: false, type: () => String }, dateOfBirth: { required: false, type: () => String }, veteranBenefits: { required: false, type: () => Boolean }, militaryStatus: { required: false, enum: require("../learner.model").MilitaryStatus }, isSpouseActive: { required: false, type: () => Boolean }, militaryBenefit: { required: false, enum: require("../learner.model").MilitaryBenefit }, wioaBenefits: { required: false, type: () => Boolean } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "firstname", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "lastname", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "fullname", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.Ethnicity),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "ethnicity", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.Gender),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "gender", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.ValidateIf(o => !o.emailAddress || o.phoneNumber),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "phoneNumber", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsEmail(),
    class_validator_1.ValidateIf(o => !o.phoneNumber || o.emailAddress),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "emailAddress", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.Matches(/((0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-[12]\d{3})/, { message: responseMessages_1.default.common.invalidDateOfBirth }),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "dateOfBirth", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.MilitaryStatus),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "militaryStatus", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(learner_model_1.MilitaryBenefit),
    __metadata("design:type", String)
], EditPersonalInformationDto.prototype, "militaryBenefit", void 0);
exports.EditPersonalInformationDto = EditPersonalInformationDto;
//# sourceMappingURL=editPersonalInformation.dto.js.map