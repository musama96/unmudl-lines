"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const white_label_banners_controller_1 = require("./white-label-banners.controller");
const white_label_banners_service_1 = require("./white-label-banners.service");
const mongoose_1 = require("@nestjs/mongoose");
const white_label_banner_model_1 = require("./white-label-banner.model");
let WhiteLabelBannersModule = class WhiteLabelBannersModule {
};
WhiteLabelBannersModule = __decorate([
    common_1.Module({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'white-label-banners', schema: white_label_banner_model_1.WhiteLabelBannerSchema }])],
        controllers: [white_label_banners_controller_1.WhiteLabelBannersController],
        providers: [white_label_banners_service_1.WhiteLabelBannersService]
    })
], WhiteLabelBannersModule);
exports.WhiteLabelBannersModule = WhiteLabelBannersModule;
//# sourceMappingURL=white-label-banners.module.js.map