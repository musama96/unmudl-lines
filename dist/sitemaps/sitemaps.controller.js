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
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sitemaps_service_1 = require("./sitemaps.service");
let SitemapsController = class SitemapsController {
    constructor(sitemapsService) {
        this.sitemapsService = sitemapsService;
    }
    async GetCollegesForSitemap() {
        return await this.sitemapsService.getCollegesForSiteMap();
    }
    async GetCoursesForSitemap() {
        return await this.sitemapsService.getCoursesForSiteMap();
    }
};
__decorate([
    common_1.Get('/colleges'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SitemapsController.prototype, "GetCollegesForSitemap", null);
__decorate([
    common_1.Get('/courses'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SitemapsController.prototype, "GetCoursesForSitemap", null);
SitemapsController = __decorate([
    swagger_1.ApiTags('Sitemap Generation'),
    common_1.Controller('sitemaps'),
    __metadata("design:paramtypes", [sitemaps_service_1.SitemapsService])
], SitemapsController);
exports.SitemapsController = SitemapsController;
//# sourceMappingURL=sitemaps.controller.js.map