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
const class_transformer_1 = require("class-transformer");
const rating_dto_1 = require("./rating.dto");
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
class PostReviewDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { courseId: { required: true, type: () => String }, ratings: { required: false, type: () => [require("./rating.dto").RatingDto] }, review: { required: false, type: () => String } };
    }
}
__decorate([
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], PostReviewDto.prototype, "courseId", void 0);
__decorate([
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => rating_dto_1.RatingDto),
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], PostReviewDto.prototype, "ratings", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], PostReviewDto.prototype, "review", void 0);
exports.PostReviewDto = PostReviewDto;
//# sourceMappingURL=postReview.dto.js.map