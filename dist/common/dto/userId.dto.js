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
const responseMessages_1 = require("../../config/responseMessages");
const swagger_1 = require("@nestjs/swagger");
const index_1 = require("../validators/index");
class UserIdDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    index_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidUserId }),
    __metadata("design:type", String)
], UserIdDto.prototype, "userId", void 0);
exports.UserIdDto = UserIdDto;
//# sourceMappingURL=userId.dto.js.map