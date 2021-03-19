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
const timeRange_dto_1 = require("../../common/dto/timeRange.dto");
const institution_dto_1 = require("./institution.dto");
const swagger_1 = require("@nestjs/swagger");
const courses_model_1 = require("../courses.model");
const courses_model_2 = require("../courses.model");
const courses_model_3 = require("../courses.model");
const customSchedule_dto_1 = require("./customSchedule.dto");
const employer_dto_1 = require("../../employers/dto/employer.dto");
const state_dto_1 = require("../../common/dto/state.dto");
const occupation_dto_1 = require("./occupation.dto");
const knowledgeOutcome_dto_1 = require("./knowledgeOutcome.dto");
const skillOutcome_dto_1 = require("./skillOutcome.dto");
const experience_dto_1 = require("./experience.dto");
const cip_certificates_dto_1 = require("./cip-certificates.dto");
const draftDuration_dto_1 = require("../../common/dto/draftDuration.dto");
const licenses_dto_1 = require("./licenses.dto");
const certifications_dto_1 = require("./certifications.dto");
const validators_1 = require("../../common/validators");
const responseMessages_1 = require("../../config/responseMessages");
const coordinates_dto_1 = require("../../common/dto/coordinates.dto");
class CreateDraftExternalDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { externalCourseId: { required: false, type: () => String }, orgId: { required: false, type: () => String }, coverPhoto: { required: false, type: () => Object }, coverPhotoPath: { required: false, type: () => String }, attachments: { required: false, type: () => [String] }, collegeId: { required: false, type: () => String }, autoEnroll: { required: false, type: () => Boolean }, institutes: { required: false, type: () => String }, title: { required: true, type: () => String }, altTag: { required: false, type: () => String }, url: { required: false, type: () => String }, isUnmudlOriginal: { required: false, type: () => Boolean }, price: { required: false, type: () => Number }, enrollmentsAllowed: { required: false, type: () => Number }, enrollmentDeadline: { required: false, type: () => String }, instructorIds: { required: false, type: () => String }, relatedCourses: { required: false, type: () => [String] }, employers: { required: false, type: () => String }, newEmployers: { required: false, type: () => String }, employersLogos: { required: false, type: () => Object }, venue: { required: false, enum: require("../courses.model").Venue }, schedule: { required: false, enum: require("../courses.model").Schedule }, address: { required: false, type: () => String }, city: { required: false, type: () => String }, state: { required: false, type: () => require("../../common/dto/state.dto").StateDto }, zip: { required: false, type: () => String }, coordinates: { required: false, type: () => require("../../common/dto/coordinates.dto").default }, followUpCourseId: { required: false, type: () => String }, date: { required: false, type: () => require("../../common/dto/draftDuration.dto").DraftDurationDto }, time: { required: false, type: () => [require("../../common/dto/timeRange.dto").TimeRangeDto] }, hoursOffered: { required: false, enum: require("../courses.model").HoursOffered, isArray: true }, hoursPerWeek: { required: false, type: () => Number }, estimatedWeeks: { required: false, type: () => Number }, description: { required: false, type: () => String }, outline: { required: false, type: () => String }, eligibilityRestrictions: { required: false, type: () => String }, performanceOutcomes: { required: false, type: () => String }, certifications: { required: false, type: () => [require("./certifications.dto").CertificationsDto] }, licenses: { required: false, type: () => [require("./licenses.dto").LicenseDto] }, certificatesPath: { required: false, type: () => String }, attendanceInformation: { required: false, type: () => String }, customSchedule: { required: false, type: () => require("./customSchedule.dto").CustomSchedule }, occupations: { required: false, type: () => [require("./occupation.dto").OccupationDto] }, knowledgeOutcomes: { required: false, type: () => [require("./knowledgeOutcome.dto").KnowledgeOutcomeDto] }, skillOutcomes: { required: false, type: () => [require("./skillOutcome.dto").SkillOutcomeDto] }, experiences: { required: false, type: () => [require("./experience.dto").ExperienceDto] }, associateDegrees: { required: false, type: () => [require("./cip-certificates.dto").CipCertificatesDto] }, certificates: { required: false, type: () => [require("./cip-certificates.dto").CipCertificatesDto] }, credits: { required: false, type: () => Number }, continuingCredits: { required: false, type: () => Number }, coverPhotoThumbnail: { required: false, type: () => Object }, coverPhotoThumbnailPath: { required: false, type: () => String }, instructorDisplayName: { required: false, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "externalCourseId", void 0);
__decorate([
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "orgId", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], CreateDraftExternalDto.prototype, "coverPhoto", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "coverPhotoPath", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], CreateDraftExternalDto.prototype, "attachments", void 0);
__decorate([
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "collegeId", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], CreateDraftExternalDto.prototype, "autoEnroll", void 0);
__decorate([
    swagger_1.ApiProperty({ default: '[{"name": "institue", "website": "institute.com" }]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_validator_1.ArrayMaxSize(5),
    class_transformer_1.Type(() => institution_dto_1.Institution),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "institutes", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "altTag", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsUrl(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "url", void 0);
__decorate([
    swagger_1.ApiProperty({ default: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], CreateDraftExternalDto.prototype, "isUnmudlOriginal", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateDraftExternalDto.prototype, "price", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateDraftExternalDto.prototype, "enrollmentsAllowed", void 0);
__decorate([
    class_validator_1.IsDateString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "enrollmentDeadline", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]' }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidInstructorIds, each: true }),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "instructorIds", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]', required: false }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId, each: true }),
    __metadata("design:type", Array)
], CreateDraftExternalDto.prototype, "relatedCourses", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d"]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ArrayMaxSize(15),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createCourse.invalidEmployerId, each: true }),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "employers", void 0);
__decorate([
    swagger_1.ApiProperty({ default: '[{"title": "employer", "website": "employer.com" }]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => employer_dto_1.Employer),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "newEmployers", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    __metadata("design:type", Object)
], CreateDraftExternalDto.prototype, "employersLogos", void 0);
__decorate([
    class_validator_1.IsEnum(courses_model_2.Venue, { message: responseMessages_1.default.createCourse.invalidVenue }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "venue", void 0);
__decorate([
    class_validator_1.IsEnum(courses_model_3.Schedule, { message: 'Choose a valid schedule.' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "schedule", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "address", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "city", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => state_dto_1.StateDto),
    class_validator_1.IsOptional(),
    __metadata("design:type", state_dto_1.StateDto)
], CreateDraftExternalDto.prototype, "state", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "zip", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, description: 'required only if InPerson/Hybrid is selected.' }),
    class_validator_1.ValidateNested(),
    class_validator_1.IsOptional(),
    class_transformer_1.Type(() => coordinates_dto_1.default),
    __metadata("design:type", coordinates_dto_1.default)
], CreateDraftExternalDto.prototype, "coordinates", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "followUpCourseId", void 0);
__decorate([
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => draftDuration_dto_1.DraftDurationDto),
    class_validator_1.IsOptional(),
    __metadata("design:type", draftDuration_dto_1.DraftDurationDto)
], CreateDraftExternalDto.prototype, "date", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '[{hoursOffered:"daytime", start: "5:17 PM", end: "9:17 PM"}]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => timeRange_dto_1.TimeRangeDto),
    __metadata("design:type", Array)
], CreateDraftExternalDto.prototype, "time", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '["daytime", "evening", "weekend", "flexibleOnline"]' }),
    validators_1.IsArray(true),
    class_validator_1.IsEnum(courses_model_1.HoursOffered, { each: true, message: responseMessages_1.default.createCourse.invalidHoursOffered }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Array)
], CreateDraftExternalDto.prototype, "hoursOffered", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateDraftExternalDto.prototype, "hoursPerWeek", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateDraftExternalDto.prototype, "estimatedWeeks", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsNotEmpty(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "outline", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "eligibilityRestrictions", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array like ["5e21bd86529642445c61bc8d", "5e21bd86529642445c61bc8g"]' }),
    validators_1.IsArray(true),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.createCourse.invalidPerformanceOutcome, each: true }),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "performanceOutcomes", void 0);
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
], CreateDraftExternalDto.prototype, "certifications", void 0);
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
], CreateDraftExternalDto.prototype, "licenses", void 0);
__decorate([
    swagger_1.ApiProperty({ description: 'enter in form of array', required: false }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.IsString({ each: true }),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "certificatesPath", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "attendanceInformation", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => customSchedule_dto_1.CustomSchedule),
    __metadata("design:type", customSchedule_dto_1.CustomSchedule)
], CreateDraftExternalDto.prototype, "customSchedule", void 0);
__decorate([
    swagger_1.ApiProperty({ type: String, default: '[{code:"17-2071.00", title: "Electrical Engineers"}]' }),
    class_validator_1.IsOptional(),
    validators_1.IsArray(true),
    class_validator_1.ValidateNested({ each: true }),
    class_transformer_1.Type(() => occupation_dto_1.OccupationDto),
    __metadata("design:type", Array)
], CreateDraftExternalDto.prototype, "occupations", void 0);
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
], CreateDraftExternalDto.prototype, "knowledgeOutcomes", void 0);
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
], CreateDraftExternalDto.prototype, "skillOutcomes", void 0);
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
], CreateDraftExternalDto.prototype, "experiences", void 0);
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
], CreateDraftExternalDto.prototype, "associateDegrees", void 0);
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
], CreateDraftExternalDto.prototype, "certificates", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateDraftExternalDto.prototype, "credits", void 0);
__decorate([
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateDraftExternalDto.prototype, "continuingCredits", void 0);
__decorate([
    swagger_1.ApiProperty({ type: 'string', format: 'binary' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], CreateDraftExternalDto.prototype, "coverPhotoThumbnail", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "coverPhotoThumbnailPath", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateDraftExternalDto.prototype, "instructorDisplayName", void 0);
exports.CreateDraftExternalDto = CreateDraftExternalDto;
//# sourceMappingURL=createDraftExternal.dto.js.map