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
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const list_dto_1 = require("../common/dto/list.dto");
const { SCORECARD_API_KEY } = require('../config/config');
let ExternalController = class ExternalController {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async fetchTitlesFromCollegeScorecard(listDto) {
        const keyword = listDto.keyword;
        const page = Number(listDto.page) ? Number(listDto.page) : 1;
        const perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 20;
        const response = await this.httpService.get('https://api.data.gov/ed/collegescorecard/v1/schools', {
            params: {
                'school.name': keyword,
                'page': page,
                'per_page': perPage,
                'api_key': SCORECARD_API_KEY,
                '_fields': 'id,school.name',
            },
        }).toPromise();
        return response.data;
    }
};
__decorate([
    swagger_1.ApiOperation({ summary: 'Get a list of college titles from College ScoreCard external API.' }),
    common_1.Get('/score-card'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_dto_1.ListDto]),
    __metadata("design:returntype", Promise)
], ExternalController.prototype, "fetchTitlesFromCollegeScorecard", null);
ExternalController = __decorate([
    swagger_1.ApiTags('External APIs'),
    common_1.Controller('external'),
    __metadata("design:paramtypes", [common_1.HttpService])
], ExternalController);
exports.ExternalController = ExternalController;
//# sourceMappingURL=external.controller.js.map