"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const blogs_controller_1 = require("./blogs.controller");
const learner_blogs_controller_1 = require("./learner-blogs.controller");
const blogs_service_1 = require("./blogs.service");
const mongoose_1 = require("@nestjs/mongoose");
const blog_model_1 = require("./blog.model");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const blog_tag_model_1 = require("../blog-tags/blog-tag.model");
const blog_tags_module_1 = require("../blog-tags/blog-tags.module");
const notifications_module_1 = require("../notifications/notifications.module");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
let BlogsModule = class BlogsModule {
};
BlogsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'blogs', schema: blog_model_1.BlogSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
                { name: 'blog-tags', schema: blog_tag_model_1.BlogTagSchema },
                { name: 'trashedBlogs', schema: blog_model_1.TrashedBlogSchema },
                { name: 'employer-companies', schema: employer_company_model_1.EmployerCompanySchema },
            ]),
            blog_tags_module_1.BlogTagsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [blogs_controller_1.BlogsController, learner_blogs_controller_1.LearnersBlogsController],
        providers: [blogs_service_1.BlogsService],
        exports: [blogs_service_1.BlogsService],
    })
], BlogsModule);
exports.BlogsModule = BlogsModule;
//# sourceMappingURL=blogs.module.js.map