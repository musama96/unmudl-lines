"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const email_logs_controller_1 = require("./email-logs.controller");
const email_logs_service_1 = require("./email-logs.service");
const mongoose_1 = require("@nestjs/mongoose");
const email_logs_model_1 = require("./email-logs.model");
let EmailLogsModule = class EmailLogsModule {
};
EmailLogsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'email-logs', schema: email_logs_model_1.EmailLogSchema },
            ]),
        ],
        controllers: [email_logs_controller_1.EmailLogsController],
        providers: [email_logs_service_1.EmailLogsService],
        exports: [email_logs_service_1.EmailLogsService]
    })
], EmailLogsModule);
exports.EmailLogsModule = EmailLogsModule;
//# sourceMappingURL=email-logs.module.js.map