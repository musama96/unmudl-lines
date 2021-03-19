import { Module, forwardRef } from '@nestjs/common';
import { ContactCollegesController } from './contact-colleges.controller';
import { ContactCollegesService } from './contact-colleges.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactCollegeProposalsSchema, ContactCollegeDraftProposalsSchema } from './contact-college.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { CollegesModule } from '../colleges/colleges.module';
import { UsersModule } from '../users/users.module';
import { MailerModule } from '@nest-modules/mailer';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-companies', schema: EmployerCompanySchema },
      { name: 'contact-college-proposals', schema: ContactCollegeProposalsSchema },
      { name: 'contact-college-draft-proposals', schema: ContactCollegeDraftProposalsSchema },
    ]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => UsersModule),
    MailerModule,
  ],
  controllers: [ContactCollegesController],
  providers: [ContactCollegesService],
  exports: [ContactCollegesService],
})
export class ContactCollegesModule {}
