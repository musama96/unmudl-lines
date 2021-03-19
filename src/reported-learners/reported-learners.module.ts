import { Module } from '@nestjs/common';
import { ReportedLearnersController } from './reported-learners.controller';
import { ReportedLearnersService } from './reported-learners.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportedLearnerSchema } from './reported-learner.model';
import {LearnerSchema} from '../learners/learner.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'reported-learners', schema: ReportedLearnerSchema }]),
    MongooseModule.forFeature([{ name: 'learners', schema: LearnerSchema }]),
  ],
  controllers: [ReportedLearnersController],
  providers: [ReportedLearnersService],
  exports: [ReportedLearnersService],
})
export class ReportedLearnersModule {}
