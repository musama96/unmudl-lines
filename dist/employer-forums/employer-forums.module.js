"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_forums_controller_1 = require("./employer-forums.controller");
const employer_forums_service_1 = require("./employer-forums.service");
const mongoose_1 = require("@nestjs/mongoose");
const employer_posts_model_1 = require("./employer-posts.model");
const employer_comments_model_1 = require("./employer-comments.model");
const employer_post_tag_model_1 = require("./employer-post-tag.model");
const id_counter_model_1 = require("../id-counters/id-counter.model");
const employer_post_report_model_1 = require("./employer-post-report.model");
const employer_replies_model_1 = require("./employer-replies.model");
const notifications_module_1 = require("../notifications/notifications.module");
let EmployerForumsModule = class EmployerForumsModule {
};
EmployerForumsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-posts', schema: employer_posts_model_1.EmployerPostSchema },
                { name: 'employer-comments', schema: employer_comments_model_1.EmployerCommentSchema },
                { name: 'employer-replies', schema: employer_replies_model_1.EmployerReplySchema },
                { name: 'employer-post-tags', schema: employer_post_tag_model_1.EmployerPostTagSchema },
                { name: 'id-counters', schema: id_counter_model_1.CounterSchema },
                { name: 'employer-post-reports', schema: employer_post_report_model_1.EmployerPostReportSchema },
            ]),
            common_1.forwardRef(() => notifications_module_1.NotificationsModule),
        ],
        controllers: [employer_forums_controller_1.EmployerPostsController],
        providers: [employer_forums_service_1.EmployerPostsService],
        exports: [employer_forums_service_1.EmployerPostsService],
    })
], EmployerForumsModule);
exports.EmployerForumsModule = EmployerForumsModule;
//# sourceMappingURL=employer-forums.module.js.map