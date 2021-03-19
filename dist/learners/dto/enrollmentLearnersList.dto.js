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
const class_validator_1 = require("class-validator");
const responseMessages_1 = require("../../config/responseMessages");
const validators_1 = require("../../common/validators");
var SearchBy;
(function (SearchBy) {
    SearchBy["KEYWORD"] = "keyword";
    SearchBy["COORDINATES"] = "coordinates";
})(SearchBy || (SearchBy = {}));
class EnrollmentLearnersListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { keyword: { required: true, type: () => String }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number }, searchBy: { required: true, enum: SearchBy }, collegeId: { required: false, type: () => String }, courseId: { required: false, type: () => String } };
    }
}
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsString({ message: responseMessages_1.default.common.invalidKeyword }),
    __metadata("design:type", String)
], EnrollmentLearnersListDto.prototype, "keyword", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], EnrollmentLearnersListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], EnrollmentLearnersListDto.prototype, "perPage", void 0);
__decorate([
    class_validator_1.IsEnum(SearchBy),
    __metadata("design:type", String)
], EnrollmentLearnersListDto.prototype, "searchBy", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCollegeId }),
    __metadata("design:type", String)
], EnrollmentLearnersListDto.prototype, "collegeId", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '' }),
    validators_1.IsMongoId(true, { message: responseMessages_1.default.common.invalidCourseId }),
    __metadata("design:type", String)
], EnrollmentLearnersListDto.prototype, "courseId", void 0);
exports.EnrollmentLearnersListDto = EnrollmentLearnersListDto;
//# sourceMappingURL=enrollmentLearnersList.dto.js.map