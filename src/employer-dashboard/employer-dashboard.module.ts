import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerSubscriptionsModule } from '../employer-subscriptions/employer-subscriptions.module';
import { BlogsModule } from '../blogs/blogs.module';
import { ContactCollegesModule } from '../contact-colleges/contact-colleges.module';
import { EmployerCompaniesModule } from '../employer-companies/employer-companies.module';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';
import { EmployerForumsModule } from '../employer-forums/employer-forums.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SourceTalentModule } from '../source-talent/source-talent.module';
import { EmployerDashboardController } from './employer-dashboard.controller';
import { EmployerDashboardService } from './employer-dashboard.service';
import { CollegesModule } from '../colleges/colleges.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'employer-companies', schema: EmployerCompanySchema }]),
    EmployerCompaniesModule,
    SourceTalentModule,
    ContactCollegesModule,
    BlogsModule,
    EmployerForumsModule,
    NotificationsModule,
    EmployerSubscriptionsModule,
    forwardRef(() => CollegesModule),
  ],
  controllers: [EmployerDashboardController],
  providers: [EmployerDashboardService],
  exports: [EmployerDashboardService],
})
export class EmployerDashboardModule {}
