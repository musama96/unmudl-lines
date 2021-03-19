"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const contact_college_categories_controller_1 = require("./contact-college-categories.controller");
const contact_college_categories_service_1 = require("./contact-college-categories.service");
const mongoose_1 = require("@nestjs/mongoose");
const contact_college_category_model_1 = require("./contact-college-category.model");
let ContactCollegeCategoriesModule = class ContactCollegeCategoriesModule {
};
ContactCollegeCategoriesModule = __decorate([
    common_1.Module({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'contact-college-categories', schema: contact_college_category_model_1.ContactCollegeCategorySchema }])],
        controllers: [contact_college_categories_controller_1.ContactCollegeCategoriesController],
        providers: [contact_college_categories_service_1.ContactCollegeCategoriesService],
        exports: [contact_college_categories_service_1.ContactCollegeCategoriesService],
    })
], ContactCollegeCategoriesModule);
exports.ContactCollegeCategoriesModule = ContactCollegeCategoriesModule;
//# sourceMappingURL=contact-college-categories.module.js.map