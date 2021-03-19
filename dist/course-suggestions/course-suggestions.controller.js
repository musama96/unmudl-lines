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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const course_suggestions_service_1 = require("./course-suggestions.service");
const addCourseSuggestion_dto_1 = require("./dto/addCourseSuggestion.dto");
let CourseSuggestionsController = class CourseSuggestionsController {
    constructor(courseSuggestionsService) {
        this.courseSuggestionsService = courseSuggestionsService;
    }
    async AddCoursesToCart(addCourseSuggestionDto, req) {
        addCourseSuggestionDto.learnerId = req.user ? req.user._id : null;
        return await this.courseSuggestionsService.addCourseSuggestion(addCourseSuggestionDto);
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Add courses suggestion.' }),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.Post(),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addCourseSuggestion_dto_1.AddCourseSuggestionDto, Object]),
    __metadata("design:returntype", Promise)
], CourseSuggestionsController.prototype, "AddCoursesToCart", null);
CourseSuggestionsController = __decorate([
    swagger_1.ApiTags('Course Suggestion'),
    common_1.Controller('course-suggestions'),
    __metadata("design:paramtypes", [course_suggestions_service_1.CourseSuggestionsService])
], CourseSuggestionsController);
exports.CourseSuggestionsController = CourseSuggestionsController;
//# sourceMappingURL=course-suggestions.controller.js.map