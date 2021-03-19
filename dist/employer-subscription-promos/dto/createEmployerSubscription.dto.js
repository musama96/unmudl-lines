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
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const duration_dto_1 = require("../../common/dto/duration.dto");
const createPromo_enum_1 = require("../../common/enums/createPromo.enum");
const responseMessages_1 = require("../../config/responseMessages");
class CreateEmployerSubscriptionPromoDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: false, type: () => String }, percentage: { required: false, type: () => Number }, maxUses: { required: false, type: () => Number }, date: { required: false, type: () => require("../../common/dto/duration.dto").DurationDto }, applyToPlans: { required: false, enum: require("../../common/enums/createPromo.enum").ApplyTo }, duration: { required: false, enum: require("../../common/enums/createPromo.enum").PromoDuration }, plans: { required: false, type: () => [String] } };
    }
}
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createPromo.invalidPromo }),
    __metadata("design:type", String)
], CreateEmployerSubscriptionPromoDto.prototype, "title", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => duration_dto_1.DurationDto),
    __metadata("design:type", duration_dto_1.DurationDto)
], CreateEmployerSubscriptionPromoDto.prototype, "date", void 0);
__decorate([
    class_validator_1.IsEnum(createPromo_enum_1.ApplyTo, { message: responseMessages_1.default.createPromo.applyTo }),
    __metadata("design:type", String)
], CreateEmployerSubscriptionPromoDto.prototype, "applyToPlans", void 0);
__decorate([
    class_validator_1.IsEnum(createPromo_enum_1.PromoDuration, { message: responseMessages_1.default.createPromo.applyTo }),
    __metadata("design:type", String)
], CreateEmployerSubscriptionPromoDto.prototype, "duration", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEmployerSubscriptionPromoDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEmployerSubscriptionPromoDto.prototype, "addedBy", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEmployerSubscriptionPromoDto.prototype, "stripeTitle", void 0);
exports.CreateEmployerSubscriptionPromoDto = CreateEmployerSubscriptionPromoDto;
//# sourceMappingURL=createEmployerSubscription.dto.js.map