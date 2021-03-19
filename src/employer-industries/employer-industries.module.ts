import { Module } from '@nestjs/common';
import { EmployerIndustriesController } from './employer-industries.controller';
import { EmployerIndustriesService } from './employer-industries.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerIndustrySchema } from './employer-industry.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'employer-industries', schema: EmployerIndustrySchema }])],
  controllers: [EmployerIndustriesController],
  providers: [EmployerIndustriesService],
  exports: [EmployerIndustriesService],
})
export class EmployerIndustriesModule {}
