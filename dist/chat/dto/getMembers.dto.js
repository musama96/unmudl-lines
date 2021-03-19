"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class GetMembersDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, perPage: { required: false, type: () => Number }, type: { required: false, enum: require("../chat.model").ChatType } };
    }
}
exports.GetMembersDto = GetMembersDto;
//# sourceMappingURL=getMembers.dto.js.map