"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class TransferPaymentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { enrollmentId: { required: false, type: () => String }, amount: { required: false, type: () => Number } };
    }
}
exports.TransferPaymentDto = TransferPaymentDto;
//# sourceMappingURL=transferPayment.dto.js.map