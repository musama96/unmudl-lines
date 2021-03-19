"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class RejectEnrollmentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { explanation: { required: true, type: () => String }, courseFull: { required: true, type: () => Boolean }, courseCancelled: { required: true, type: () => Boolean }, furtherInfo: { required: true, type: () => Boolean }, minRequirements: { required: true, type: () => Boolean } };
    }
}
exports.RejectEnrollmentDto = RejectEnrollmentDto;
//# sourceMappingURL=rejectEnrollment.dto.js.map