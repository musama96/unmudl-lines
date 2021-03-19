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
class CourseIdsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { courses: { required: true, type: () => [String] } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' }),
    validators_1.IsArray(false),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidCourseId, each: true }),
    __metadata("design:type", Array)
], CourseIdsDto.prototype, "courses", void 0);
exports.CourseIdsDto = CourseIdsDto;
//# sourceMappingURL=courseIds.dto.js.map