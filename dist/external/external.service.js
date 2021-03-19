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
const common_1 = require("@nestjs/common");
const config_1 = require("../config/config");
let ExternalService = class ExternalService {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getLmsToken() {
        return await this.httpService
            .post(config_1.PRAGYA_URL_GET_TOKEN, {
            key: config_1.PRAGYA_KEY,
            secret: config_1.PRAGYA_SECRET,
        })
            .toPromise();
    }
    async createLmsUser(user) {
        return await this.httpService
            .post(config_1.PRAGYA_URL_CREATE_USER, user, {
            headers: {
                authorization: `Bearer ${user.accessToken}`,
            },
        })
            .toPromise();
    }
    async createLmsEnrollment(enrollment) {
        return await this.httpService
            .post(config_1.PRAGYA_URL_CREATE_ENROLLMENT, enrollment, {
            headers: {
                authorization: `Bearer ${enrollment.accessToken}`,
            },
        })
            .toPromise();
    }
    async cancelLmsEnrollment(enrollment) {
        return await this.httpService
            .post(config_1.PRAGYA_URL_CREATE_ENROLLMENT, enrollment, {
            headers: {
                authorization: `Bearer ${enrollment.accessToken}`,
            },
        })
            .toPromise();
    }
    async getCourseLaunch(course) {
        try {
            return await this.httpService
                .post(config_1.PRAGYA_URL_GET_COURSE_LAUNCH_URL, course, {
                headers: {
                    authorization: `Bearer ${course.accessToken}`,
                },
            })
                .toPromise();
        }
        catch (e) {
            return {
                data: {
                    courseLaunchURL: null,
                },
            };
        }
    }
};
ExternalService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [common_1.HttpService])
], ExternalService);
exports.ExternalService = ExternalService;
//# sourceMappingURL=external.service.js.map