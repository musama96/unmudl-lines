"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mongoose_1 = require("@nestjs/mongoose");
const users_module_1 = require("./users/users.module");
const locations_module_1 = require("./locations/locations.module");
const auth_module_1 = require("./auth/auth.module");
const learners_module_1 = require("./learners/learners.module");
const colleges_module_1 = require("./colleges/colleges.module");
const courses_module_1 = require("./courses/courses.module");
const promos_module_1 = require("./promos/promos.module");
const external_module_1 = require("./external/external.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const mailer_1 = require("@nest-modules/mailer");
const reported_learners_module_1 = require("./reported-learners/reported-learners.module");
const config_1 = require("./config/config");
const reviews_module_1 = require("./reviews/reviews.module");
const stripe_module_1 = require("./stripe/stripe.module");
const invitations_module_1 = require("./invitations/invitations.module");
const blogs_module_1 = require("./blogs/blogs.module");
const activities_module_1 = require("./activities/activities.module");
const transactions_module_1 = require("./transactions/transactions.module");
const payouts_module_1 = require("./payouts/payouts.module");
const partner_groups_module_1 = require("./partner-groups/partner-groups.module");
const blog_tags_module_1 = require("./blog-tags/blog-tags.module");
const landing_page_module_1 = require("./landing-page/landing-page.module");
const bug_reports_module_1 = require("./bug-reports/bug-reports.module");
const refund_requests_module_1 = require("./refund-requests/refund-requests.module");
const partner_requests_module_1 = require("./partner-requests/partner-requests.module");
const reported_activities_module_1 = require("./reported-activities/reported-activities.module");
const schedule_1 = require("@nestjs/schedule");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const posts_module_1 = require("./posts/posts.module");
const employers_module_1 = require("./employers/employers.module");
const notifications_module_1 = require("./notifications/notifications.module");
const id_counters_module_1 = require("./id-counters/id-counters.module");
const college_invitations_module_1 = require("./college-invitations/college-invitations.module");
const ses = require("nodemailer-ses-transport");
const handlebars_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/handlebars.adapter");
const enquiries_module_1 = require("./enquiries/enquiries.module");
const internal_chat_module_1 = require("./internal-chat/internal-chat.module");
const tax_rates_module_1 = require("./tax-rates/tax-rates.module");
const employer_admins_module_1 = require("./employer-admins/employer-admins.module");
const employer_companies_module_1 = require("./employer-companies/employer-companies.module");
const employer_invitations_module_1 = require("./employer-invitations/employer-invitations.module");
const employer_admin_invitations_module_1 = require("./employer-admin-invitations/employer-admin-invitations.module");
const employer_enquiries_module_1 = require("./employer-enquiries/employer-enquiries.module");
const contact_colleges_module_1 = require("./contact-colleges/contact-colleges.module");
const contact_college_categories_module_1 = require("./contact-college-categories/contact-college-categories.module");
const employer_industries_module_1 = require("./employer-industries/employer-industries.module");
const chat_module_1 = require("./chat/chat.module");
const employer_forums_module_1 = require("./employer-forums/employer-forums.module");
const contact_college_responses_module_1 = require("./contact-college-responses/contact-college-responses.module");
const employer_requests_module_1 = require("./employer-requests/employer-requests.module");
const redis_cache_module_1 = require("./redis-cache/redis-cache.module");
const course_suggestions_module_1 = require("./course-suggestions/course-suggestions.module");
const source_talent_module_1 = require("./source-talent/source-talent.module");
const gift_a_course_module_1 = require("./gift-a-course/gift-a-course.module");
const employer_dashboard_module_1 = require("./employer-dashboard/employer-dashboard.module");
const unmudl_access_logs_module_1 = require("./unmudl-access-logs/unmudl-access-logs.module");
const employer_subscriptions_module_1 = require("./employer-subscriptions/employer-subscriptions.module");
const email_logs_module_1 = require("./email-logs/email-logs.module");
const white_label_banners_module_1 = require("./white-label-banners/white-label-banners.module");
const employer_subscription_promos_module_1 = require("./employer-subscription-promos/employer-subscription-promos.module");
const sitemaps_module_1 = require("./sitemaps/sitemaps.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forRoot(config_1.MONGOURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true,
            }),
            mailer_1.MailerModule.forRoot({
                transport: config_1.MAILER_MODE === 'local'
                    ? {
                        host: config_1.MAILER_HOST,
                        port: config_1.MAILER_PORT,
                        secure: config_1.MAILER_SECURE,
                        auth: {
                            user: config_1.MAILER_AUTH_USER,
                            pass: config_1.MAILER_AUTH_PASS,
                        },
                    }
                    : ses({
                        accessKeyId: process.env.MAILER_ACCESS_KEY_ID,
                        secretAccessKey: process.env.MAILER_SECRET_ACCESS,
                        region: process.env.MAILER_REGION,
                    }),
                template: {
                    dir: __dirname + '/common/templates/emails',
                    adapter: new handlebars_adapter_1.HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
                options: {
                    partials: {
                        dir: __dirname + '/common/templates/partials',
                        options: {
                            strict: true,
                        },
                    },
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            learners_module_1.LearnersModule,
            colleges_module_1.CollegesModule,
            courses_module_1.CoursesModule,
            promos_module_1.PromosModule,
            external_module_1.ExternalModule,
            enrollments_module_1.EnrollmentsModule,
            reported_learners_module_1.ReportedLearnersModule,
            reviews_module_1.ReviewsModule,
            stripe_module_1.StripeModule,
            invitations_module_1.InvitationsModule,
            blogs_module_1.BlogsModule,
            locations_module_1.LocationsModule,
            activities_module_1.ActivitiesModule,
            transactions_module_1.TransactionsModule,
            payouts_module_1.PayoutsModule,
            partner_groups_module_1.PartnerGroupsModule,
            blog_tags_module_1.BlogTagsModule,
            landing_page_module_1.LandingPageModule,
            bug_reports_module_1.BugReportsModule,
            refund_requests_module_1.RefundRequestsModule,
            partner_requests_module_1.PartnerRequestsModule,
            reported_activities_module_1.ReportedActivitiesModule,
            schedule_1.ScheduleModule.forRoot(),
            dashboard_module_1.DashboardModule,
            posts_module_1.PostsModule,
            employers_module_1.EmployersModule,
            notifications_module_1.NotificationsModule,
            id_counters_module_1.IdCountersModule,
            college_invitations_module_1.CollegeInvitationsModule,
            enquiries_module_1.EnquiriesModule,
            internal_chat_module_1.InternalChatModule,
            tax_rates_module_1.TaxRatesModule,
            employer_admins_module_1.EmployerAdminsModule,
            employer_companies_module_1.EmployerCompaniesModule,
            employer_invitations_module_1.EmployerInvitationsModule,
            employer_admin_invitations_module_1.EmployerAdminInvitationsModule,
            employer_enquiries_module_1.EmployerEnquiriesModule,
            contact_colleges_module_1.ContactCollegesModule,
            contact_college_categories_module_1.ContactCollegeCategoriesModule,
            employer_industries_module_1.EmployerIndustriesModule,
            chat_module_1.ChatModule,
            employer_forums_module_1.EmployerForumsModule,
            contact_college_responses_module_1.ContactCollegeResponsesModule,
            employer_requests_module_1.EmployerRequestsModule,
            redis_cache_module_1.RedisCacheModule,
            course_suggestions_module_1.CourseSuggestionsModule,
            source_talent_module_1.SourceTalentModule,
            gift_a_course_module_1.GiftACourseModule,
            unmudl_access_logs_module_1.UnmudlAccessLogsModule,
            employer_dashboard_module_1.EmployerDashboardModule,
            employer_subscriptions_module_1.EmployerSubscriptionsModule,
            email_logs_module_1.EmailLogsModule,
            white_label_banners_module_1.WhiteLabelBannersModule,
            employer_subscription_promos_module_1.EmployerSubscriptionPromosModule,
            sitemaps_module_1.SitemapsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map