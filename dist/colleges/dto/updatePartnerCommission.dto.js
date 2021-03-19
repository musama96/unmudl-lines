"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class UpdatePartnerCommissionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { commission: { required: true, type: () => Number } };
    }
}
exports.UpdatePartnerCommissionDto = UpdatePartnerCommissionDto;
//# sourceMappingURL=updatePartnerCommission.dto.js.map