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
const class_validator_1 = require("class-validator");
class UpdateEmployerAdminPreferencesDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => Boolean }, proposal: { required: true, type: () => Boolean }, chat: { required: true, type: () => Boolean }, newNotification: { required: true, type: () => Boolean } };
    }
}
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateEmployerAdminPreferencesDto.prototype, "email", void 0);
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateEmployerAdminPreferencesDto.prototype, "proposal", void 0);
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateEmployerAdminPreferencesDto.prototype, "chat", void 0);
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateEmployerAdminPreferencesDto.prototype, "newNotification", void 0);
exports.UpdateEmployerAdminPreferencesDto = UpdateEmployerAdminPreferencesDto;
//# sourceMappingURL=updateEmployerAdminPreferences.dto.js.map