"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class UpdateFooterContentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { about: { required: false, type: () => String }, why: { required: false, type: () => String }, privacyPolicy: { required: false, type: () => String }, termsOfService: { required: false, type: () => String }, accessibilty: { required: false, type: () => String } };
    }
}
exports.UpdateFooterContentDto = UpdateFooterContentDto;
//# sourceMappingURL=updateFooterContent.dto.js.map