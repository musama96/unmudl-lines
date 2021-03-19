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
const swagger_1 = require("@nestjs/swagger");
const responseMessages_1 = require("../../config/responseMessages");
const courses_model_1 = require("../courses.model");
const courses_model_2 = require("../courses.model");
const validators_1 = require("../../common/validators");
var CourseType;
(function (CourseType) {
    CourseType["IN_DEMAND"] = "in demand";
    CourseType["HIGHLY_RATED"] = "highly rated";
    CourseType["ALL_COURSES"] = "all courses";
})(CourseType = exports.CourseType || (exports.CourseType = {}));
var LearnerCourseListSortBy;
(function (LearnerCourseListSortBy) {
    LearnerCourseListSortBy["Relevance"] = "relevance";
    LearnerCourseListSortBy["ComunityCollege"] = "communityCollege";
    LearnerCourseListSortBy["HighestPrice"] = "highestPrice";
    LearnerCourseListSortBy["LowestPrice"] = "lowestPrice";
    LearnerCourseListSortBy["MostRecent"] = "mostRecent";
})(LearnerCourseListSortBy = exports.LearnerCourseListSortBy || (exports.LearnerCourseListSortBy = {}));
var Funding;
(function (Funding) {
    Funding["WIOA"] = "WIOA";
    Funding["VETERAN_BENEFITS"] = "veteranBenefits";
})(Funding = exports.Funding || (exports.Funding = {}));
class LearnersCoursesListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: false, type: () => String }, colleges: { required: false, type: () => [String] }, employers: { required: false, type: () => [String] }, collegeNames: { required: false, type: () => [String] }, minPrice: { required: false, type: () => Number }, maxPrice: { required: false, type: () => Number }, rating: { required: false, type: () => Number }, page: { required: false, type: () => Number }, perPage: { required: false, type: () => Number }, collegeId: { required: false, type: () => String }, startDate: { required: false, type: () => String }, endDate: { required: false, type: () => String }, courseType: { required: false, enum: require("../courses.model").Venue, isArray: true }, relatedCredentials: { required: false, enum: require("../courses.model").RelatedCredentials, isArray: true }, funding: { required: false, enum: require("./learnersCoursesList.dto").Funding, isArray: true }, hoursOffered: { required: false, enum: require("../courses.model").HoursOffered, isArray: true }, knowledgeOutcomes: { required: false, type: () => [String] }, categories: { required: false, type: () => [String] }, occupations: { required: false, type: () => [String] }, skillOutcomes: { required: false, type: () => [String] }, experiences: { required: false, type: () => [String] }, minEnrollments: { required: false, type: () => Number }, maxEnrollments: { required: false, type: () => Number }, lat: { required: false, type: () => Number }, lng: { required: false, type: () => Number }, sort: { required: false, enum: require("./learnersCoursesList.dto").LearnerCourseListSortBy }, credits: { required: false, type: () => Boolean }, continuingCredits: { required: false, type: () => Boolean } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: 'You must enter a string to search.' }),
    __metadata("design:type", String)
], LearnersCoursesListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array like ["5ee48cf232c8833992e59cff", "5e87130e722c5a0f1c4928be"]' }),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "colleges", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array like ["5ee48cf232c8833992e59cff", "5e87130e722c5a0f1c4928be"]' }),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "employers", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array' }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "collegeNames", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '0' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "minPrice", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "maxPrice", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "rating", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "perPage", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], LearnersCoursesListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidStartDate }),
    __metadata("design:type", String)
], LearnersCoursesListDto.prototype, "startDate", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString({ message: responseMessages_1.default.common.invalidEndDate }),
    __metadata("design:type", String)
], LearnersCoursesListDto.prototype, "endDate", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["inperson", "online", "onlineScheduled", "blended"]', required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ArrayMinSize(1),
    class_validator_1.IsEnum(courses_model_2.Venue, { each: true, message: responseMessages_1.default.createCourse.invalidVenue }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "courseType", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["License", "Certificate", "Certification"]', required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ArrayMinSize(1),
    class_validator_1.IsEnum(courses_model_1.RelatedCredentials, { each: true, message: responseMessages_1.default.createCourse.invalidRelatedCredentials }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "relatedCredentials", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["WIOA", "veteranBenefits"]', required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ArrayMinSize(1),
    class_validator_1.IsEnum(Funding, { each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "funding", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["daytime", "evening", "weekend", "flexibleOnline"]', required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ArrayMinSize(1),
    class_validator_1.IsEnum(courses_model_1.HoursOffered, { each: true, message: responseMessages_1.default.createCourse.invalidHoursOffered }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "hoursOffered", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, required: false, default: '["Mechanical"]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "knowledgeOutcomes", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "categories", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, required: false, default: '["Educational, Guidance, School, & Vocational Counselors"]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "occupations", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, required: false, default: '["Repairing"]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "skillOutcomes", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, required: false, default: '["Mechanical"]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], LearnersCoursesListDto.prototype, "experiences", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: 15 }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "minEnrollments", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: 15 }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "maxEnrollments", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsLatitude({ message: responseMessages_1.default.common.invalidLat }),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "lat", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsLongitude({ message: responseMessages_1.default.common.invalidLng }),
    __metadata("design:type", Number)
], LearnersCoursesListDto.prototype, "lng", void 0);
exports.LearnersCoursesListDto = LearnersCoursesListDto;
//# sourceMappingURL=learnersCoursesList.dto.js.map