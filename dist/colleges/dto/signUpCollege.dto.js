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
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const state_dto_1 = require("../../common/dto/state.dto");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
const url_dto_1 = require("./url.dto");
const contact_dto_1 = require("./contact.dto");
const responseMessages_1 = require("../../config/responseMessages");
class SignUpCollegeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { token: { required: false, type: () => String }, profilePhoto: { required: false, type: () => Object }, collegeLogo: { required: false, type: () => Object }, collegeBanner: { required: false, type: () => Object }, fullname: { required: true, type: () => String }, password: { required: true, type: () => String }, designation: { required: true, type: () => String }, role: { required: false, type: () => String }, timeZone: { required: false, type: () => String }, description: { required: false, type: () => String }, communityCollegeId: { required: false, type: () => String }, coordinates: { required: false, type: () => require("../../common/dto/coordinates.dto").default }, url: { required: false, type: () => require("./url.dto").default }, contact: { required: false, type: () => require("./contact.dto").default }, title: { required: true, type: () => String }, address: { required: true, type: () => String }, streetAddress: { required: false, type: () => String }, city: { required: true, type: () => String }, state: { required: true, type: () => require("../../common/dto/state.dto").StateDto }, zip: { required: true, type: () => String }, country: { required: false, type: () => String }, timezone: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "_id", void 0);
__decorate([
    swagger_1.ApiProperty({ required: true }),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.common.requiredToken }),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "token", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], SignUpCollegeDto.prototype, "profilePhoto", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "profilePhotoThumbnail", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], SignUpCollegeDto.prototype, "collegeLogo", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], SignUpCollegeDto.prototype, "collegeBanner", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "collegeLogoThumbnail", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "invitation", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createCollege.fullname }),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "fullname", void 0);
__decorate([
    class_validator_1.Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[A-Za-z]).{6,}$/, '', { message: responseMessages_1.default.createCollege.invalidPassword }),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "password", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "designation", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "timeZone", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", coordinates_dto_1.default)
], SignUpCollegeDto.prototype, "coordinates", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => url_dto_1.default),
    __metadata("design:type", url_dto_1.default)
], SignUpCollegeDto.prototype, "url", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => contact_dto_1.default),
    __metadata("design:type", contact_dto_1.default)
], SignUpCollegeDto.prototype, "contact", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "title", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "address", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "streetAddress", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "city", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], SignUpCollegeDto.prototype, "state", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], SignUpCollegeDto.prototype, "zip", void 0);
exports.SignUpCollegeDto = SignUpCollegeDto;
//# sourceMappingURL=signUpCollege.dto.js.map