"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const posts_controller_1 = require("./posts.controller");
const posts_service_1 = require("./posts.service");
const mongoose_1 = require("@nestjs/mongoose");
const posts_model_1 = require("./posts.model");
const replies_model_1 = require("./replies.model");
const post_tag_model_1 = require("./post-tag.model");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const post_report_model_1 = require("./post-report.model");
let PostsModule = class PostsModule {
};
PostsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'posts', schema: posts_model_1.PostSchema },
                { name: 'replies', schema: replies_model_1.ReplySchema },
                { name: 'post-tags', schema: post_tag_model_1.PostTagSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
                { name: 'post-reports', schema: post_report_model_1.PostReportSchema },
            ]),
        ],
        controllers: [posts_controller_1.PostsController],
        providers: [posts_service_1.PostsService],
    })
], PostsModule);
exports.PostsModule = PostsModule;
//# sourceMappingURL=posts.module.js.map