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
const validators_1 = require("../../common/validators");
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
var CourseListStatus;
(function (CourseListStatus) {
    CourseListStatus["ALL"] = "all";
    CourseListStatus["PUBLISHED"] = "published";
    CourseListStatus["COMING_SOON"] = "coming_soon";
    CourseListStatus["UNPUBLISH"] = "unpublished";
})(CourseListStatus = exports.CourseListStatus || (exports.CourseListStatus = {}));
class CoursesListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, minPrice: { required: false, type: () => Number }, maxPrice: { required: false, type: () => Number }, daysLeft: { required: false, type: () => Number }, open: { required: false, type: () => Number }, openApplied: { required: false, type: () => Boolean }, rating: { required: false, type: () => Number }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, sortOrder: { required: false, type: () => String }, sortBy: { required: false, type: () => String }, collegeId: { required: false, type: () => String }, status: { required: false, enum: require("./coursesList.dto").CourseListStatus }, courseIds: { required: false, type: () => [String] } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: 'You must enter a string to search.' }),
    __metadata("design:type", String)
], CoursesListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '0' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "minPrice", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "maxPrice", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "daysLeft", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "open", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean({ message: 'Open applied must be a boolean.' }),
    __metadata("design:type", Boolean)
], CoursesListDto.prototype, "openApplied", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "rating", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CoursesListDto.prototype, "perPage", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: 'You must enter a valid mongodb id.' }),
    __metadata("design:type", String)
], CoursesListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiHideProperty(),
    __metadata("design:type", String)
], CoursesListDto.prototype, "instructorId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CoursesListDto.prototype, "status", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId, each: true }),
    __metadata("design:type", Array)
], CoursesListDto.prototype, "courseIds", void 0);
exports.CoursesListDto = CoursesListDto;
//# sourceMappingURL=coursesList.dto.js.map