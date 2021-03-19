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
const ResponseHandler_1 = require("../common/ResponseHandler");
let WhiteLabelBannersService = class WhiteLabelBannersService {
    constructor(whiteLabelBannerModel) {
        this.whiteLabelBannerModel = whiteLabelBannerModel;
    }
    async getWhiteLabelBanner(identifier) {
        const banner = await this.whiteLabelBannerModel.findOne({ identifier, live: true }).lean().exec();
        return banner ? ResponseHandler_1.default.success(banner) : ResponseHandler_1.default.fail('Invalid Identifier');
    }
};
WhiteLabelBannersService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('white-label-banners')),
    __metadata("design:paramtypes", [Object])
], WhiteLabelBannersService);
exports.WhiteLabelBannersService = WhiteLabelBannersService;
//# sourceMappingURL=white-label-banners.service.js.map