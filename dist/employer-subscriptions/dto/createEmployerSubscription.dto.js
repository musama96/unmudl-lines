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
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
class CreateEmployerSubscriptionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { plan: { required: false, type: () => String }, priceStripeId: { required: false, type: () => String }, card: { required: false, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidEmployerSubscriptionPlanId }),
    __metadata("design:type", String)
], CreateEmployerSubscriptionDto.prototype, "plan", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createEmployerSubscription.priceStripeId }),
    __metadata("design:type", String)
], CreateEmployerSubscriptionDto.prototype, "priceStripeId", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createEmployerSubscription.stripeCardId }),
    __metadata("design:type", String)
], CreateEmployerSubscriptionDto.prototype, "card", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEmployerSubscriptionDto.prototype, "employer", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CreateEmployerSubscriptionDto.prototype, "stripeCustomerId", void 0);
exports.CreateEmployerSubscriptionDto = CreateEmployerSubscriptionDto;
//# sourceMappingURL=createEmployerSubscription.dto.js.map