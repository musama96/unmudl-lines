"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const course_suggestions_controller_1 = require("./course-suggestions.controller");
const course_suggestions_service_1 = require("./course-suggestions.service");
const mongoose_1 = require("@nestjs/mongoose");
const course_suggestion_model_1 = require("./course-suggestion.model");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let CourseSuggestionsModule = class CourseSuggestionsModule {
};
CourseSuggestionsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'course-suggestions', schema: course_suggestion_model_1.CourseSuggestionSchema },
            ]),
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
        ],
        controllers: [course_suggestions_controller_1.CourseSuggestionsController],
        providers: [course_suggestions_service_1.CourseSuggestionsService],
    })
], CourseSuggestionsModule);
exports.CourseSuggestionsModule = CourseSuggestionsModule;
//# sourceMappingURL=course-suggestions.module.js.map