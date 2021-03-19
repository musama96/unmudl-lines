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
const url_dto_1 = require("./url.dto");
const contact_dto_1 = require("./contact.dto");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
const swagger_1 = require("@nestjs/swagger");
const state_dto_1 = require("../../common/dto/state.dto");
class CreateCollegeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { _id: { required: false, type: () => String }, profilePhoto: { required: false, type: () => Object }, collegeLogo: { required: false, type: () => Object }, description: { required: false, type: () => String }, communityCollegeId: { required: false, type: () => String }, coordinates: { required: true, type: () => require("../../common/dto/coordinates.dto").default }, url: { required: true, type: () => require("./url.dto").default }, contact: { required: true, type: () => require("./contact.dto").default }, title: { required: true, type: () => String }, address: { required: true, type: () => String }, city: { required: true, type: () => String }, state: { required: true, type: () => require("../../common/dto/state.dto").StateDto }, zip: { required: true, type: () => String }, country: { required: true, type: () => String }, timezone: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateCollegeDto.prototype, "profilePhoto", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateCollegeDto.prototype, "collegeLogo", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    __metadata("design:type", coordinates_dto_1.default)
], CreateCollegeDto.prototype, "coordinates", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => url_dto_1.default),
    __metadata("design:type", url_dto_1.default)
], CreateCollegeDto.prototype, "url", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => contact_dto_1.default),
    __metadata("design:type", contact_dto_1.default)
], CreateCollegeDto.prototype, "contact", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCollegeDto.prototype, "title", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCollegeDto.prototype, "address", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCollegeDto.prototype, "city", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], CreateCollegeDto.prototype, "state", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCollegeDto.prototype, "zip", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCollegeDto.prototype, "country", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCollegeDto.prototype, "timezone", void 0);
exports.CreateCollegeDto = CreateCollegeDto;
//# sourceMappingURL=createCollege.dto.js.map