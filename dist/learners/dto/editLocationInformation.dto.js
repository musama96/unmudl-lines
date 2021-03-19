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
const state_dto_1 = require("../../common/dto/state.dto");
const class_transformer_1 = require("class-transformer");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
class EditLocationInformationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { address: { required: false, type: () => String }, coordinates: { required: false, type: () => require("../../common/dto/coordinates.dto").default }, city: { required: false, type: () => String }, state: { required: false, type: () => require("../../common/dto/state.dto").StateDto }, country: { required: false, type: () => String }, zip: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], EditLocationInformationDto.prototype, "address", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    class_validator_1.IsOptional(),
    __metadata("design:type", coordinates_dto_1.default)
], EditLocationInformationDto.prototype, "coordinates", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], EditLocationInformationDto.prototype, "city", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], EditLocationInformationDto.prototype, "state", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EditLocationInformationDto.prototype, "country", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EditLocationInformationDto.prototype, "zip", void 0);
exports.EditLocationInformationDto = EditLocationInformationDto;
//# sourceMappingURL=editLocationInformation.dto.js.map