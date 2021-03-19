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
const validators_1 = require("../../common/validators");
const responseMessages_1 = require("../../config/responseMessages");
class CreateContactCollegeCategoryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: false, type: () => String }, subcategories: { required: false, type: () => Object } };
    }
}
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsNotEmpty({ message: responseMessages_1.default.createContactCollegeCategory.title }),
    __metadata("design:type", String)
], CreateContactCollegeCategoryDto.prototype, "title", void 0);
__decorate([
    swagger_1.ApiProperty({ example: ['test title'] }),
    validators_1.IsArray(true, { message: responseMessages_1.default.createContactCollegeCategory.subcategoryTitleArr }),
    class_validator_1.IsString({ each: true, message: responseMessages_1.default.createContactCollegeCategory.subcategoryTitle }),
    __metadata("design:type", Object)
], CreateContactCollegeCategoryDto.prototype, "subcategories", void 0);
exports.CreateContactCollegeCategoryDto = CreateContactCollegeCategoryDto;
//# sourceMappingURL=create-contact-college-category.dto.js.map