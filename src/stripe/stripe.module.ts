import { Module, forwardRef } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { UsersModule } from '../users/users.module';
import { CollegesModule } from '../colleges/colleges.module';
import { LearnersModule } from '../learners/learners.module';
import { EmployerAdminsModule } from '../employer-admins/employer-admins.module';
import { EmployerCompaniesModule } from '../employer-companies/employer-companies.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => LearnersModule),
    forwardRef(() => EmployerAdminsModule),
    forwardRef(() => EmployerCompaniesModule),
  ],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
