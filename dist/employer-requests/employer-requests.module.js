"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const employer_requests_controller_1 = require("./employer-requests.controller");
const employer_requests_service_1 = require("./employer-requests.service");
const mongoose_1 = require("@nestjs/mongoose");
const employer_request_model_1 = require("./employer-request.model");
const user_model_1 = require("../users/user.model");
const notifications_module_1 = require("../notifications/notifications.module");
const learner_employer_requests_controller_1 = require("./learner-employer-requests.controller");
const email_logs_module_1 = require("../email-logs/email-logs.module");
let EmployerRequestsModule = class EmployerRequestsModule {
};
EmployerRequestsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'employer-requests', schema: employer_request_model_1.EmployerRequestSchema },
                { name: 'users', schema: user_model_1.UserSchema },
            ]),
            notifications_module_1.NotificationsModule,
            common_1.forwardRef(() => email_logs_module_1.EmailLogsModule),
        ],
        controllers: [employer_requests_controller_1.EmployerRequestsController, learner_employer_requests_controller_1.LearnerEmployerRequestsController],
        providers: [employer_requests_service_1.EmployerRequestsService],
        exports: [employer_requests_service_1.EmployerRequestsService],
    })
], EmployerRequestsModule);
exports.EmployerRequestsModule = EmployerRequestsModule;
//# sourceMappingURL=employer-requests.module.js.map