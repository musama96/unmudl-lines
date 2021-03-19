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
const redis_cache_module_1 = require("../redis-cache/redis-cache.module");
const college_model_1 = require("../colleges/college.model");
const courses_model_1 = require("../courses/courses.model");
const sitemaps_controller_1 = require("./sitemaps.controller");
const sitemaps_service_1 = require("./sitemaps.service");
let SitemapsModule = class SitemapsModule {
};
SitemapsModule = __decorate([
    common_1.Module({
        imports: [
            redis_cache_module_1.RedisCacheModule,
            mongoose_1.MongooseModule.forFeature([
                { name: 'colleges', schema: college_model_1.CollegeSchema },
                { name: 'courses', schema: courses_model_1.CourseSchema },
            ]),
        ],
        controllers: [sitemaps_controller_1.SitemapsController],
        providers: [sitemaps_service_1.SitemapsService]
    })
], SitemapsModule);
exports.SitemapsModule = SitemapsModule;
//# sourceMappingURL=sitemaps.module.js.map