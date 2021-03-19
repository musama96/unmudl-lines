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
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
class ReportPostDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { postId: { required: false, type: () => String }, replyId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ description: 'Id of the post' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.post.postId }),
    __metadata("design:type", String)
], ReportPostDto.prototype, "postId", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'Id of the reply' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.post.replyId }),
    __metadata("design:type", String)
], ReportPostDto.prototype, "replyId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ReportPostDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], ReportPostDto.prototype, "learnerId", void 0);
exports.ReportPostDto = ReportPostDto;
//# sourceMappingURL=reportPost.dto.js.map