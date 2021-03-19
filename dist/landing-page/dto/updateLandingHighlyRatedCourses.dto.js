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
const validators_1 = require("../../common/validators");
class UpdateLandingHighlyRatedCoursesDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { highlyRated: { required: true, type: () => [String] }, highlyRatedTitle: { required: true, type: () => String }, highlyRatedDescription: { required: true, type: () => String }, hideHighlyRated: { required: true, type: () => Boolean } };
    }
}
__decorate([
    validators_1.IsArray(false, { message: responseMessages_1.default.updateLanding.highlyRated }),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.updateLanding.highlyRated, each: true }),
    __metadata("design:type", Array)
], UpdateLandingHighlyRatedCoursesDto.prototype, "highlyRated", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateLandingHighlyRatedCoursesDto.prototype, "highlyRatedTitle", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], UpdateLandingHighlyRatedCoursesDto.prototype, "highlyRatedDescription", void 0);
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], UpdateLandingHighlyRatedCoursesDto.prototype, "hideHighlyRated", void 0);
exports.UpdateLandingHighlyRatedCoursesDto = UpdateLandingHighlyRatedCoursesDto;
//# sourceMappingURL=updateLandingHighlyRatedCourses.dto.js.map