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
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
const duration_dto_1 = require("../../common/dto/duration.dto");
const timeRange_dto_1 = require("../../common/dto/timeRange.dto");
const institution_dto_1 = require("./institution.dto");
const responseMessages_1 = require("../../config/responseMessages");
const swagger_1 = require("@nestjs/swagger");
const courses_model_1 = require("../courses.model");
const courses_model_2 = require("../courses.model");
const courses_model_3 = require("../courses.model");
const customSchedule_dto_1 = require("./customSchedule.dto");
const JsonParse = str => {
    return JSON.parse(str);
};
const employer_dto_1 = require("../../employers/dto/employer.dto");
const state_dto_1 = require("../../common/dto/state.dto");
const occupation_dto_1 = require("./occupation.dto");
const knowledgeOutcome_dto_1 = require("./knowledgeOutcome.dto");
const skillOutcome_dto_1 = require("./skillOutcome.dto");
const experience_dto_1 = require("./experience.dto");
const cip_certificates_dto_1 = require("./cip-certificates.dto");
const licenses_dto_1 = require("./licenses.dto");
const certifications_dto_1 = require("./certifications.dto");
const validators_1 = require("../../common/validators");
class CreateCourseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { externalCourseId: { required: false, type: () => String }, coverPhoto: { required: false, type: () => Object }, coverPhotoPath: { required: false, type: () => String }, attachments: { required: false, type: () => [String] }, attachmentPaths: { required: true, type: () => [String] }, collegeId: { required: false, type: () => String }, autoEnroll: { required: false, type: () => Boolean }, institutes: { required: false, type: () => String }, title: { required: true, type: () => String }, altTag: { required: false, type: () => String }, url: { required: false, type: () => String }, isUnmudlOriginal: { required: true, type: () => Boolean }, price: { required: true, type: () => Number }, displayPrice: { required: false, type: () => Number }, enrollmentsAllowed: { required: true, type: () => Number }, enrollmentDeadline: { required: true, type: () => String }, instructorIds: { required: true, type: () => String }, relatedCourses: { required: false, type: () => [String] }, employers: { required: false, type: () => String }, newEmployers: { required: false, type: () => String }, employersLogos: { required: false, type: () => Object }, venue: { required: true, enum: require("../courses.model").Venue }, schedule: { required: true, enum: require("../courses.model").Schedule }, address: { required: false, type: () => String }, city: { required: false, type: () => String }, state: { required: false, type: () => require("../../common/dto/state.dto").StateDto }, zip: { required: false, type: () => String }, coordinates: { required: false, type: () => require("../../common/dto/coordinates.dto").default }, followUpCourseId: { required: false, type: () => String }, date: { required: false, type: () => require("../../common/dto/duration.dto").DurationDto }, time: { required: false, type: () => [require("../../common/dto/timeRange.dto").TimeRangeDto] }, hoursOffered: { required: true, enum: require("../courses.model").HoursOffered, isArray: true }, hoursPerWeek: { required: false, type: () => Number }, estimatedWeeks: { required: false, type: () => Number }, description: { required: true, type: () => String }, outline: { required: false, type: () => String }, eligibilityRestrictions: { required: false, type: () => String }, performanceOutcomes: { required: false, type: () => String }, certifications: { required: false, type: () => [require("./certifications.dto").CertificationsDto] }, certificatesPath: { required: false, type: () => String }, attendanceInformation: { required: false, type: () => String }, customSchedule: { required: false, type: () => require("./customSchedule.dto").CustomSchedule }, occupations: { required: false, type: () => [require("./occupation.dto").OccupationDto] }, licenses: { required: false, type: () => [require("./licenses.dto").LicenseDto] }, knowledgeOutcomes: { required: false, type: () => [require("./knowledgeOutcome.dto").KnowledgeOutcomeDto] }, skillOutcomes: { required: false, type: () => [require("./skillOutcome.dto").SkillOutcomeDto] }, experiences: { required: false, type: () => [require("./experience.dto").ExperienceDto] }, associateDegrees: { required: false, type: () => [require("./cip-certificates.dto").CipCertificatesDto] }, certificates: { required: false, type: () => [require("./cip-certificates.dto").CipCertificatesDto] }, credits: { required: false, type: () => Number }, continuingCredits: { required: false, type: () => Number }, coverPhotoThumbnail: { required: false, type: () => Object }, coverPhotoThumbnailPath: { required: false, type: () => String }, draftId: { required: false, type: () => String }, instructorDisplayName: { required: false, type: () => String }, isDisplayPrice: { required: false, type: () => Boolean }, status: { required: false, enum: require("../courses.model").CourseStatus }, categories: { required: false, type: () => [String] }, timeZone: { required: false, type: () => String }, wioaFunds: { required: false, type: () => Boolean }, veteranBenefits: { required: false, type: () => Boolean } };
    }
}
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], CreateCourseDto.prototype, "coverPhoto", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "coverPhotoPath", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "attachments", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        description: 'Array of existing attachments paths eg, ["/uploads/courses-attachments/about-1582704877177.html"]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "attachmentPaths", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "collegeId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "autoEnroll", void 0);
__decorate([
    swagger_1.ApiProperty({ default: '[{"name": "institue", "website": "institute.com" }]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_validator_1.ArrayMaxSize(5),
    class_transformer_1.Type(() => institution_dto_1.Institution),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "institutes", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "altTag", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsUrl(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "url", void 0);
__decorate([
    swagger_1.ApiProperty({ default: false }),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "isUnmudlOriginal", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "price", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "enrollmentsAllowed", void 0);
__decorate([
    class_validator_1.IsDateString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "enrollmentDeadline", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]' }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidInstructorIds, each: true }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "instructorIds", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]', required: false }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId, each: true }),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "relatedCourses", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]' }),
    validators_1.IsArray(true),
    class_validator_1.ArrayMaxSize(15),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createCourse.invalidEmployerId, each: true }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "employers", void 0);
__decorate([
    swagger_1.ApiProperty({ default: '[{"title": "employer", "website": "employer.com" }]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => employer_dto_1.Employer),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "newEmployers", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateCourseDto.prototype, "employersLogos", void 0);
__decorate([
    class_validator_1.IsEnum(courses_model_2.Venue, { message: responseMessages_1.default.createCourse.invalidVenue }),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "venue", void 0);
__decorate([
    class_validator_1.IsEnum(courses_model_3.Schedule, { message: 'Choose a valid schedule.' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "schedule", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "address", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "city", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    __metadata("design:type", state_dto_1.StateDto)
], CreateCourseDto.prototype, "state", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "zip", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.ValidateNested(),
    class_validator_1.IsOptional(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    __metadata("design:type", coordinates_dto_1.default)
], CreateCourseDto.prototype, "coordinates", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "followUpCourseId", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => duration_dto_1.DurationDto),
    class_validator_1.IsOptional(),
    __metadata("design:type", duration_dto_1.DurationDto)
], CreateCourseDto.prototype, "date", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '[{hoursOffered:"daytime", start: "5:17 PM", end: "9:17 PM"}]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => timeRange_dto_1.TimeRangeDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "time", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["daytime", "evening", "weekend", "flexibleOnline"]' }),
    validators_1.IsArray(true),
    class_validator_1.IsEnum(courses_model_1.HoursOffered, { each: true, message: responseMessages_1.default.createCourse.invalidHoursOffered }),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "hoursOffered", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "hoursPerWeek", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "estimatedWeeks", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "outline", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "eligibilityRestrictions", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createCourse.invalidPerformanceOutcome, each: true }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "performanceOutcomes", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{Id:"6714-A", Name: "Academic Certification in Neurofeedback", Organization: "Biofeedback Certification International Alliance", Description: "This certification path requires an MA/MS degree from a regionally-accredited academic institution, in no specified field, and is for those who wish to use neurofeedback in an academic, research, or supervisory setting and who do not clinically treat medical/psychological disorders"}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => certifications_dto_1.CertificationsDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "certifications", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array', required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "certificatesPath", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "attendanceInformation", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => customSchedule_dto_1.CustomSchedule),
    __metadata("design:type", customSchedule_dto_1.CustomSchedule)
], CreateCourseDto.prototype, "customSchedule", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '[{code:"17-2071.00", title: "Electrical Engineers"}]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => occupation_dto_1.OccupationDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "occupations", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{ID:"10-EDUCA08310", Title: "Teacher of Trade & Industry: Medical Assisting", Description: "Teacher of Trade & Industry: Medical Assisting"}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => licenses_dto_1.LicenseDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "licenses", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{id:"2.C.3.e", name: "Mechanical", description: "Knowledge of machines and tools, including their designs, uses, repair, and maintenance.", level: 1}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => knowledgeOutcome_dto_1.KnowledgeOutcomeDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "knowledgeOutcomes", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{id:"2.A.1.b", name: "Active Listening", description: "Giving full attention to what other people are saying, taking time to understand the points being made, asking questions as appropriate, and not interrupting at inappropriate times.", level: 1}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => skillOutcome_dto_1.SkillOutcomeDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "skillOutcomes", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{id:"4.A.1.a.2.I07.D09", name: "Monitor work areas or procedures to ensure compliance with safety procedures.", hours: 0}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => experience_dto_1.ExperienceDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "experiences", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{CIPTitle: "Natural Resources/Conservation", CIPCode: "03.0101", CIPDefinition: "A general program that focuses on the studies and activities relating to the natural environment and its conservation"}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => cip_certificates_dto_1.CipCertificatesDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "associateDegrees", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: String,
        default: '[{CIPTitle: "Natural Resources/Conservation", CIPCode: "03.0101", CIPDefinition: "A general program that focuses on the studies and activities relating to the natural environment and its conservation"}]',
    }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => cip_certificates_dto_1.CipCertificatesDto),
    __metadata("design:type", Array)
], CreateCourseDto.prototype, "certificates", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "credits", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "continuingCredits", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], CreateCourseDto.prototype, "coverPhotoThumbnail", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "coverPhotoThumbnailPath", void 0);
__decorate([
    validators_1.IsMongoId(true),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "draftId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "instructorDisplayName", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], CreateCourseDto.prototype, "isDisplayPrice", void 0);
exports.CreateCourseDto = CreateCourseDto;
//# sourceMappingURL=createCourse.dto.js.map