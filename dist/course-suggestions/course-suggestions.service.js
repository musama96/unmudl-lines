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
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mailer_1 = require("@nest-modules/mailer");
const moment = require("moment");
const ResponseHandler_1 = require("../common/ResponseHandler");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let CourseSuggestionsService = class CourseSuggestionsService {
    constructor(courseSuggetsionModel, mailerService, emailLogsService) {
        this.courseSuggetsionModel = courseSuggetsionModel;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
    }
    async addCourseSuggestion(courseSuggestion) {
        const newCourseSuggestion = await this.courseSuggetsionModel.create(courseSuggestion);
        const mailData = {
            to: process.env.SUPPORT_MAIL,
            from: process.env.ADMIN_NOTIFICATION_FROM,
            subject: 'Unmudl Notification',
            template: 'courseSuggestionMail',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                date: moment(new Date()).format('LL'),
                courseSuggestion,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
        return ResponseHandler_1.default.success({}, 'Your request has been submitted successfully. Thank you for suggesting a new course for Unmudl.');
    }
};
CourseSuggestionsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('course-suggestions')),
    __metadata("design:paramtypes", [Object, mailer_1.MailerService,
        email_logs_service_1.EmailLogsService])
], CourseSuggestionsService);
exports.CourseSuggestionsService = CourseSuggestionsService;
//# sourceMappingURL=course-suggestions.service.js.map