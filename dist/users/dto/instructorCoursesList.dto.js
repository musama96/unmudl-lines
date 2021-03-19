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
const sort_enum_1 = require("../../common/enums/sort.enum");
const validators_1 = require("../../common/validators");
class InstructorCoursesListDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, column: { required: true, enum: require("../../common/enums/sort.enum").InstructorCoursesColumns }, order: { required: true, enum: require("../../common/enums/sort.enum").InstructorCoursesOrder }, page: { required: true, type: () => Number }, perPage: { required: true, type: () => Number } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    validators_1.IsMongoId(false, { message: responseMessages_1.default.common.invalidUserId }),
    __metadata("design:type", String)
], InstructorCoursesListDto.prototype, "userId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(sort_enum_1.InstructorCoursesColumns),
    __metadata("design:type", String)
], InstructorCoursesListDto.prototype, "column", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(sort_enum_1.InstructorCoursesOrder),
    __metadata("design:type", String)
], InstructorCoursesListDto.prototype, "order", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '1' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], InstructorCoursesListDto.prototype, "page", void 0);
__decorate([
    swagger_1.ApiProperty({ required: false, default: '10' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], InstructorCoursesListDto.prototype, "perPage", void 0);
exports.InstructorCoursesListDto = InstructorCoursesListDto;
//# sourceMappingURL=instructorCoursesList.dto.js.map