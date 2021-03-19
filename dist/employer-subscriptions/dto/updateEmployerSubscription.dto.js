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
class UpdateEmployerSubscriptionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { plan: { required: false, type: () => String }, promo: { required: false, type: () => String }, priceStripeId: { required: false, type: () => String }, card: { required: false, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidEmployerSubscriptionPlanId }),
    __metadata("design:type", String)
], UpdateEmployerSubscriptionDto.prototype, "plan", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidPromoId }),
    __metadata("design:type", String)
], UpdateEmployerSubscriptionDto.prototype, "promo", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateEmployerSubscriptionDto.prototype, "employer", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], UpdateEmployerSubscriptionDto.prototype, "stripeCustomerId", void 0);
exports.UpdateEmployerSubscriptionDto = UpdateEmployerSubscriptionDto;
//# sourceMappingURL=updateEmployerSubscription.dto.js.map