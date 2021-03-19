"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const landing_page_controller_1 = require("./landing-page.controller");
const courses_module_1 = require("../courses/courses.module");
const blogs_module_1 = require("../blogs/blogs.module");
const landing_page_service_1 = require("./landing-page.service");
const mongoose_1 = require("@nestjs/mongoose");
const landing_page_model_1 = require("./landing-page.model");
const courses_model_1 = require("../courses/courses.model");
const college_model_1 = require("../colleges/college.model");
const blog_model_1 = require("../blogs/blog.model");
const redis_cache_module_1 = require("../redis-cache/redis-cache.module");
const employer_model_1 = require("../employers/employer.model");
let LandingPageModule = class LandingPageModule {
};
LandingPageModule = __decorate([
    common_1.Module({
        imports: [
            courses_module_1.CoursesModule,
            blogs_module_1.BlogsModule,
            redis_cache_module_1.RedisCacheModule,
            mongoose_1.MongooseModule.forFeature([
                { name: 'landing-page', schema: landing_page_model_1.LandingPageSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'blogs', schema: blog_model_1.BlogSchema },
                { name: 'employers', schema: employer_model_1.EmployerSchema },
            ]),
        ],
        controllers: [landing_page_controller_1.LandingPageController],
        providers: [landing_page_service_1.LandingPageService],
    })
], LandingPageModule);
exports.LandingPageModule = LandingPageModule;
//# sourceMappingURL=landing-page.module.js.map