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
const unmudl_access_log_model_1 = require("./unmudl-access-log.model");
const unmudl_access_logs_controller_1 = require("./unmudl-access-logs.controller");
const unmudl_access_logs_service_1 = require("./unmudl-access-logs.service");
let UnmudlAccessLogsModule = class UnmudlAccessLogsModule {
};
UnmudlAccessLogsModule = __decorate([
    common_1.Module({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'unmudl-access-logs', schema: unmudl_access_log_model_1.UnmudlAccessLogSchema }])],
        controllers: [unmudl_access_logs_controller_1.UnmudlAccessLogsController],
        providers: [unmudl_access_logs_service_1.UnmudlAccessLogsService],
        exports: [unmudl_access_logs_service_1.UnmudlAccessLogsService],
    })
], UnmudlAccessLogsModule);
exports.UnmudlAccessLogsModule = UnmudlAccessLogsModule;
//# sourceMappingURL=unmudl-access-logs.module.js.map