import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from '../chat/chat.module';
import { CourseSchema } from '../courses/courses.model';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { UserSchema } from '../users/user.model';
import { SourceTalentController } from './source-talent.controller';
import { SourceTalentSchema } from './source-talent.model';
import { SourceTalentService } from './source-talent.service';
import { ChatSchema } from '../chat/chat.model';
import { MailerModule } from '@nest-modules/mailer';
import { UsersModule } from '../users/users.module';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: SourceTalentSchema, name: 'source-talent' },
      { schema: CourseSchema, name: 'courses' },
      { schema: EnrollmentSchema, name: 'enrollments' },
      { schema: UserSchema, name: 'users' },
      { schema: ChatSchema, name: 'chats' },
      { schema: EmployerCompanySchema, name: 'employer-companies' },
    ]),
    forwardRef(() => ChatModule),
    forwardRef(() => MailerModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [SourceTalentController],
  providers: [SourceTalentService],
  exports: [SourceTalentService],
})
export class SourceTalentModule {}
