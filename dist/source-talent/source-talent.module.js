"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const chat_module_1 = require("../chat/chat.module");
const courses_model_1 = require("../courses/courses.model");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const user_model_1 = require("../users/user.model");
const source_talent_controller_1 = require("./source-talent.controller");
const source_talent_model_1 = require("./source-talent.model");
const source_talent_service_1 = require("./source-talent.service");
const chat_model_1 = require("../chat/chat.model");
const mailer_1 = require("@nest-modules/mailer");
const users_module_1 = require("../users/users.module");
const employer_company_model_1 = require("../employer-companies/employer-company.model");
let SourceTalentModule = class SourceTalentModule {
};
SourceTalentModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { schema: source_talent_model_1.SourceTalentSchema, name: 'source-talent' },
                { schema: courses_model_1.CourseSchema, name: 'courses' },
                { schema: enrollment_model_1.EnrollmentSchema, name: 'enrollments' },
                { schema: user_model_1.UserSchema, name: 'users' },
                { schema: chat_model_1.ChatSchema, name: 'chats' },
                { schema: employer_company_model_1.EmployerCompanySchema, name: 'employer-companies' },
            ]),
            common_1.forwardRef(() => chat_module_1.ChatModule),
            common_1.forwardRef(() => mailer_1.MailerModule),
            common_1.forwardRef(() => users_module_1.UsersModule),
        ],
        controllers: [source_talent_controller_1.SourceTalentController],
        providers: [source_talent_service_1.SourceTalentService],
        exports: [source_talent_service_1.SourceTalentService],
    })
], SourceTalentModule);
exports.SourceTalentModule = SourceTalentModule;
//# sourceMappingURL=source-talent.module.js.map