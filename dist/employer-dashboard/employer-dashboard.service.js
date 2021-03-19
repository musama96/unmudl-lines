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
const employer_subscriptions_service_1 = require("../employer-subscriptions/employer-subscriptions.service");
const blogs_service_1 = require("../blogs/blogs.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const contact_colleges_service_1 = require("../contact-colleges/contact-colleges.service");
const employer_forums_service_1 = require("../employer-forums/employer-forums.service");
const notifications_service_1 = require("../notifications/notifications.service");
const source_talent_service_1 = require("../source-talent/source-talent.service");
const colleges_service_1 = require("../colleges/colleges.service");
const mongoose_1 = require("@nestjs/mongoose");
let EmployerDashboardService = class EmployerDashboardService {
    constructor(sourceTalentService, collegesService, contactCollegesService, blogsService, employerPostsService, notificationsService, employerSubscriptionsService, employerModel) {
        this.sourceTalentService = sourceTalentService;
        this.collegesService = collegesService;
        this.contactCollegesService = contactCollegesService;
        this.blogsService = blogsService;
        this.employerPostsService = employerPostsService;
        this.notificationsService = notificationsService;
        this.employerSubscriptionsService = employerSubscriptionsService;
        this.employerModel = employerModel;
    }
    async getCompleteDashboardData(params) {
        const { employerId, countEnd, countStart, employerAdminId } = params;
        const [{ data: activeSourceTalents }, { data: activeCollegeProposals }, { data: blogPosts }, { data: forumTopics }, { data: sourceTalentActivities }, { data: contactCollegeActivities }, { data: employerForumActivities }, { data: currentSubscriptionPlan },] = await Promise.all([
            await this.sourceTalentService.getActiveSourceTalentRepliesCount(employerId, { start: countStart, end: countEnd }),
            await this.contactCollegesService.getActiveProposalsCount(employerId),
            await this.blogsService.getBlogPostsByEmployer(employerId),
            await this.employerPostsService.getForumTopics(employerId),
            await this.notificationsService.getSourceTalentActivity({
                user: employerAdminId,
                userType: 'employerAdmin',
                page: 1,
                perPage: 4,
                sortBy: 'createdAt',
                sortOrder: -1,
            }),
            await this.notificationsService.getContactCollegesActivity({
                user: employerAdminId,
                userType: 'employerAdmin',
                page: 1,
                perPage: 3,
                sortBy: 'createdAt',
                sortOrder: -1,
            }),
            await this.notificationsService.getEmployerForumActivity({
                user: employerAdminId,
                userType: 'employerAdmin',
                page: 1,
                perPage: 4,
                sortBy: 'createdAt',
                sortOrder: -1,
            }),
            await this.employerSubscriptionsService.getEmployerCurrentSubscriptionPlan(employerId),
        ]);
        let subscription = null;
        if (currentSubscriptionPlan) {
            subscription = currentSubscriptionPlan.toObject();
            switch (currentSubscriptionPlan.activePlan.level) {
                case 0:
                    subscription.connectedColleges = currentSubscriptionPlan.connectedCollege ? [currentSubscriptionPlan.connectedCollege] : [];
                    delete subscription.connectedCollege;
                    break;
                case 1:
                    if (currentSubscriptionPlan.connectedState.shortName) {
                        const { data: colleges } = await this.collegesService.getCollegesByStateShortNameForEmployerSubscriptions(currentSubscriptionPlan.connectedState.shortName);
                        subscription.connectedColleges = colleges;
                    }
                    else {
                        subscription.connectedColleges = [];
                    }
                    break;
                case 2:
                    const { data: colleges } = await this.collegesService.getCollegesByStateShortNameForEmployerSubscriptions('');
                    subscription.connectedColleges = colleges;
                    break;
            }
        }
        return ResponseHandler_1.default.success({
            counts: { activeSourceTalents, activeCollegeProposals, blogPosts, forumTopics },
            sourceTalentActivities,
            contactCollegeActivities,
            employerForumActivities,
            currentSubscriptionPlan: subscription,
        });
    }
    async getContactCollegeActivity(params) {
        const { employerAdminId, page, perPage } = params;
        const { data: contactCollegeActivities } = await this.notificationsService.getContactCollegesActivity({
            user: employerAdminId,
            userType: 'employerAdmin',
            page,
            perPage,
            sortBy: 'createdAt',
            sortOrder: -1,
        });
        return ResponseHandler_1.default.success(contactCollegeActivities);
    }
    async getSourceTalentActivity(params) {
        const { employerAdminId, page, perPage } = params;
        const { data: sourceTalentActivities } = await this.notificationsService.getSourceTalentActivity({
            user: employerAdminId,
            userType: 'employerAdmin',
            page,
            perPage,
            sortBy: 'createdAt',
            sortOrder: -1,
        });
        return ResponseHandler_1.default.success(sourceTalentActivities);
    }
    async getEmployerForumActivity(params) {
        const { employerAdminId, page, perPage } = params;
        const { data: sourceTalentActivities } = await this.notificationsService.getEmployerForumActivity({
            user: employerAdminId,
            userType: 'employerAdmin',
            page,
            perPage,
            sortBy: 'createdAt',
            sortOrder: -1,
        });
        return ResponseHandler_1.default.success(sourceTalentActivities);
    }
    async getDashboardMetrics(params) {
        const { employerId, countEnd, countStart } = params;
        const [{ data: activeSourceTalents }, { data: activeCollegeProposals }, { data: blogPosts }, { data: forumTopics },] = await Promise.all([
            await this.sourceTalentService.getActiveSourceTalentRepliesCount(employerId, { start: countStart, end: countEnd }),
            await this.contactCollegesService.getActiveProposalsCount(employerId),
            await this.blogsService.getBlogPostsByEmployer(employerId),
            await this.employerPostsService.getForumTopics(employerId),
        ]);
        return ResponseHandler_1.default.success({ activeSourceTalents, activeCollegeProposals, blogPosts, forumTopics });
    }
};
EmployerDashboardService = __decorate([
    common_1.Injectable(),
    __param(7, mongoose_1.InjectModel('employer-companies')),
    __metadata("design:paramtypes", [source_talent_service_1.SourceTalentService,
        colleges_service_1.CollegesService,
        contact_colleges_service_1.ContactCollegesService,
        blogs_service_1.BlogsService,
        employer_forums_service_1.EmployerPostsService,
        notifications_service_1.NotificationsService,
        employer_subscriptions_service_1.EmployerSubscriptionsService, Object])
], EmployerDashboardService);
exports.EmployerDashboardService = EmployerDashboardService;
//# sourceMappingURL=employer-dashboard.service.js.map