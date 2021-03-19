import { Module } from '@nestjs/common';
import { BugReportsController } from './bug-reports.controller';
import { BugReportsService } from './bug-reports.service';
import {MongooseModule} from '@nestjs/mongoose';
import {BugReportSchema} from './bug-report.model';
import {LearnerBugReportsController} from './learner-bug-reports.controller';

@Module({
  imports: [MongooseModule.forFeature([{name: 'bug-reports', schema: BugReportSchema}])],
  controllers: [BugReportsController, LearnerBugReportsController],
  providers: [BugReportsService],
  exports: [BugReportsService],
})
export class BugReportsModule {}
