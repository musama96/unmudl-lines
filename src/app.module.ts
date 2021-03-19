import { Module, Inject, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { AuthModule } from './auth/auth.module';
import { LearnersModule } from './learners/learners.module';
import { CollegesModule } from './colleges/colleges.module';
import { CoursesModule } from './courses/courses.module';
import { PromosModule } from './promos/promos.module';
import { ExternalModule } from './external/external.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { MailerModule } from '@nest-modules/mailer';
import { ReportedLearnersModule } from './reported-learners/reported-learners.module';

import { MAILER_HOST, MAILER_PORT, MAILER_SECURE, MAILER_AUTH_USER, MAILER_AUTH_PASS, MONGOURI, MAILER_MODE } from './config/config';
import { ReviewsModule } from './reviews/reviews.module';
import { StripeModule } from './stripe/stripe.module';
import { InvitationsModule } from './invitations/invitations.module';
import { BlogsModule } from './blogs/blogs.module';
import { ActivitiesModule } from './activities/activities.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PartnerGroupsModule } from './partner-groups/partner-groups.module';
import { BlogTagsModule } from './blog-tags/blog-tags.module';
import { LandingPageModule } from './landing-page/landing-page.module';
import { BugReportsModule } from './bug-reports/bug-reports.module';
import { RefundRequestsModule } from './refund-requests/refund-requests.module';
import { PartnerRequestsModule } from './partner-requests/partner-requests.module';
import { ReportedActivitiesModule } from './reported-activities/reported-activities.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardModule } from './dashboard/dashboard.module';
import { PostsModule } from './posts/posts.module';
import { EmployersModule } from './employers/employers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IdCountersModule } from './id-counters/id-counters.module';
import { CollegeInvitationsModule } from './college-invitations/college-invitations.module';
import ses = require('nodemailer-ses-transport');
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { InternalChatModule } from './internal-chat/internal-chat.module';
import { TaxRatesModule } from './tax-rates/tax-rates.module';
import { EmployerAdminsModule } from './employer-admins/employer-admins.module';
import { EmployerCompaniesModule } from './employer-companies/employer-companies.module';
import { EmployerInvitationsModule } from './employer-invitations/employer-invitations.module';
import { EmployerAdminInvitationsModule } from './employer-admin-invitations/employer-admin-invitations.module';
import { EmployerEnquiriesModule } from './employer-enquiries/employer-enquiries.module';
import { ContactCollegesModule } from './contact-colleges/contact-colleges.module';
import { ContactCollegeCategoriesModule } from './contact-college-categories/contact-college-categories.module';
import { EmployerIndustriesModule } from './employer-industries/employer-industries.module';
import { ChatModule } from './chat/chat.module';
import { EmployerForumsModule } from './employer-forums/employer-forums.module';
import { ContactCollegeResponsesModule } from './contact-college-responses/contact-college-responses.module';
import { EmployerRequestsModule } from './employer-requests/employer-requests.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { CourseSuggestionsModule } from './course-suggestions/course-suggestions.module';
import { SourceTalentModule } from './source-talent/source-talent.module';
import { GiftACourseModule } from './gift-a-course/gift-a-course.module';
import { EmployerDashboardModule } from './employer-dashboard/employer-dashboard.module';
import { UnmudlAccessLogsModule } from './unmudl-access-logs/unmudl-access-logs.module';
import { EmployerSubscriptionsModule } from './employer-subscriptions/employer-subscriptions.module';
import { EmailLogsModule } from './email-logs/email-logs.module';
import { WhiteLabelBannersModule } from './white-label-banners/white-label-banners.module';
import { EmployerSubscriptionPromosModule } from './employer-subscription-promos/employer-subscription-promos.module';
import { SitemapsModule } from './sitemaps/sitemaps.module';

@Module({
  imports: [
    MongooseModule.forRoot(MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      // connectionFactory: (connection) => {
      //   // connection.plugin(require('mongoose-autopopulate'));
      //   autoIncrement.initialize(mongoose.connection);
      //   return connection;
      // },
    }),
    // MongooseModule.forFeatureAsync([
    //   {
    //     name: 'users',
    //     useFactory: () => {
    //       const schema = UserSchema;
    //       schema.plugin(AutoIncrement, { inc_field: 'numId' });
    //       return schema;
    //     },
    //   },
    // ]),
    MailerModule.forRoot({
      transport:
        MAILER_MODE === 'local'
          ? {
              host: MAILER_HOST,
              port: MAILER_PORT,
              secure: MAILER_SECURE,
              auth: {
                user: MAILER_AUTH_USER,
                pass: MAILER_AUTH_PASS,
              },
            }
          : ses({
              accessKeyId: process.env.MAILER_ACCESS_KEY_ID,
              secretAccessKey: process.env.MAILER_SECRET_ACCESS,
              region: process.env.MAILER_REGION,
            }),
      template: {
        dir: __dirname + '/common/templates/emails',
        adapter: new HandlebarsAdapter(),
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
    AuthModule,
    UsersModule,
    LearnersModule,
    CollegesModule,
    CoursesModule,
    PromosModule,
    ExternalModule,
    EnrollmentsModule,
    ReportedLearnersModule,
    ReviewsModule,
    StripeModule,
    InvitationsModule,
    BlogsModule,
    LocationsModule,
    ActivitiesModule,
    TransactionsModule,
    PayoutsModule,
    PartnerGroupsModule,
    BlogTagsModule,
    LandingPageModule,
    BugReportsModule,
    RefundRequestsModule,
    PartnerRequestsModule,
    ReportedActivitiesModule,
    ScheduleModule.forRoot(),
    DashboardModule,
    PostsModule,
    EmployersModule,
    NotificationsModule,
    IdCountersModule,
    CollegeInvitationsModule,
    EnquiriesModule,
    InternalChatModule,
    TaxRatesModule,
    EmployerAdminsModule,
    EmployerCompaniesModule,
    EmployerInvitationsModule,
    EmployerAdminInvitationsModule,
    EmployerEnquiriesModule,
    ContactCollegesModule,
    ContactCollegeCategoriesModule,
    EmployerIndustriesModule,
    ChatModule,
    EmployerForumsModule,
    ContactCollegeResponsesModule,
    EmployerRequestsModule,
    RedisCacheModule,
    CourseSuggestionsModule,
    SourceTalentModule,
    GiftACourseModule,
    UnmudlAccessLogsModule,
    EmployerDashboardModule,
    EmployerSubscriptionsModule,
    EmailLogsModule,
    WhiteLabelBannersModule,
    EmployerSubscriptionPromosModule,
    SitemapsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
