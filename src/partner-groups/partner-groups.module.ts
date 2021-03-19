import { Module } from '@nestjs/common';
import { PartnerGroupsController } from './partner-groups.controller';
import { PartnerGroupsService } from './partner-groups.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerGroupSchema } from './partner-group.model';
import { CollegeSchema } from '../colleges/college.model';
import { EmployerGroupSchema } from './employer-group.model';
import { EmployerGroupsController } from './employer-groups.controller';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'partner-groups', schema: PartnerGroupSchema },
      { name: 'employer-groups', schema: EmployerGroupSchema },
      { name: 'colleges', schema: CollegeSchema },
      { name: 'employer-companies', schema: EmployerCompanySchema },
    ]),
  ],
  controllers: [PartnerGroupsController, EmployerGroupsController],
  providers: [PartnerGroupsService],
  exports: [PartnerGroupsService],
})
export class PartnerGroupsModule {}
