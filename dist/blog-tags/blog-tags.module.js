"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const blog_tags_controller_1 = require("./blog-tags.controller");
const blog_tags_service_1 = require("./blog-tags.service");
const mongoose_1 = require("@nestjs/mongoose");
const blog_tag_model_1 = require("./blog-tag.model");
const blog_model_1 = require("../blogs/blog.model");
let BlogTagsModule = class BlogTagsModule {
};
BlogTagsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'blog-tags', schema: blog_tag_model_1.BlogTagSchema },
                { name: 'blogs', schema: blog_model_1.BlogSchema },
            ]),
        ],
        controllers: [blog_tags_controller_1.BlogTagsController],
        providers: [blog_tags_service_1.BlogTagsService],
        exports: [blog_tags_service_1.BlogTagsService],
    })
], BlogTagsModule);
exports.BlogTagsModule = BlogTagsModule;
//# sourceMappingURL=blog-tags.module.js.map