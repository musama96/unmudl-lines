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
const redisKeys_1 = require("../config/redisKeys");
const redis_cache_service_1 = require("../redis-cache/redis-cache.service");
const courses_model_1 = require("../courses/courses.model");
let SitemapsService = class SitemapsService {
    constructor(collegeModel, courseModel, redisCacheService) {
        this.collegeModel = collegeModel;
        this.courseModel = courseModel;
        this.redisCacheService = redisCacheService;
    }
    async getCollegesForSiteMap() {
        const redisConnected = await this.redisCacheService.checkClient();
        const cachedData = redisConnected ? await this.redisCacheService.get(redisKeys_1.RedisKeys.sitemapColleges) : null;
        if (!cachedData) {
            const colleges = await this.collegeModel.find({ isSuspended: { $ne: true }, invitation: { $ne: 'pending' } }, 'title numId').sort({ title: 1 }).lean().exec();
            if (redisConnected) {
                await this.redisCacheService.set(redisKeys_1.RedisKeys.sitemapColleges, colleges, 43200);
            }
            return ResponseHandler_1.default.success(colleges);
        }
        else {
            return ResponseHandler_1.default.success(cachedData);
        }
    }
    async getCoursesForSiteMap() {
        const redisConnected = await this.redisCacheService.checkClient();
        const cachedData = redisConnected ? await this.redisCacheService.get(redisKeys_1.RedisKeys.sitemapCourses) : null;
        if (!cachedData) {
            const suspendedColleges = await this.collegeModel.find({ isSuspended: true }, '_id').lean().exec();
            const suspendedCollegeIds = suspendedColleges.map(college => college._id);
            const courses = await this.courseModel.find({ enrollmentDeadline: { $gte: new Date() }, unpublishedDate: null, status: { $ne: courses_model_1.CourseStatus.COMING_SOON } }, 'title numId').sort({ enrollmentDeadline: 1 }).lean().exec();
            if (redisConnected) {
                await this.redisCacheService.set(redisKeys_1.RedisKeys.sitemapCourses, courses, 43200);
            }
            return ResponseHandler_1.default.success(courses);
        }
        else {
            return ResponseHandler_1.default.success(cachedData);
        }
    }
};
SitemapsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('colleges')),
    __param(1, mongoose_1.InjectModel('courses')),
    __metadata("design:paramtypes", [Object, Object, redis_cache_service_1.RedisCacheService])
], SitemapsService);
exports.SitemapsService = SitemapsService;
//# sourceMappingURL=sitemaps.service.js.map