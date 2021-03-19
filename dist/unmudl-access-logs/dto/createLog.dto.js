"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class CreateLogDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, type: () => Object }, user: { required: true, type: () => String }, employer: { required: false, type: () => String }, college: { required: false, type: () => String } };
    }
}
exports.CreateLogDto = CreateLogDto;
//# sourceMappingURL=createLog.dto.js.map