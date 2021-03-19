"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class StateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { longName: { required: true, type: () => String }, shortName: { required: true, type: () => String } };
    }
}
exports.StateDto = StateDto;
//# sourceMappingURL=state.dto.js.map