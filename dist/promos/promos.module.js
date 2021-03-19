"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const promos_controller_1 = require("./promos.controller");
const promos_service_1 = require("./promos.service");
const mongoose_1 = require("@nestjs/mongoose");
const promo_model_1 = require("./promo.model");
const enrollment_model_1 = require("../enrollments/enrollment.model");
const notifications_module_1 = require("../notifications/notifications.module");
let PromosModule = class PromosModule {
};
PromosModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'promos', schema: promo_model_1.PromoSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'enrollments', schema: enrollment_model_1.EnrollmentSchema }]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [promos_controller_1.PromosController],
        providers: [promos_service_1.PromosService],
        exports: [promos_service_1.PromosService],
    })
], PromosModule);
exports.PromosModule = PromosModule;
//# sourceMappingURL=promos.module.js.map