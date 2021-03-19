"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class StripeTokenDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { stripeToken: { required: true, type: () => String } };
    }
}
exports.StripeTokenDto = StripeTokenDto;
//# sourceMappingURL=stripeToken.dto.js.map