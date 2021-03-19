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
const responseMessages_1 = require("../../config/responseMessages");
const swagger_1 = require("@nestjs/swagger");
const validators_1 = require("../../common/validators");
var MessageFrom;
(function (MessageFrom) {
    MessageFrom["USER"] = "user";
    MessageFrom["ADMIN"] = "admin";
})(MessageFrom = exports.MessageFrom || (exports.MessageFrom = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["READ"] = "read";
    MessageStatus["UNREAD"] = "unread";
})(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
class NewEnquiryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { learner: { required: true, type: () => String }, course: { required: true, type: () => String }, message: { required: true, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidLearnerId }),
    __metadata("design:type", String)
], NewEnquiryDto.prototype, "learner", void 0);
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], NewEnquiryDto.prototype, "course", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], NewEnquiryDto.prototype, "from", void 0);
__decorate([
    class_validator_1.IsNotEmpty({ message: 'Message cannot be empty' }),
    __metadata("design:type", String)
], NewEnquiryDto.prototype, "message", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], NewEnquiryDto.prototype, "collegeRep", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(MessageStatus),
    swagger_1.ApiProperty({ default: MessageStatus.UNREAD }),
    __metadata("design:type", String)
], NewEnquiryDto.prototype, "status", void 0);
exports.NewEnquiryDto = NewEnquiryDto;
//# sourceMappingURL=newEnquiry.dto.js.map