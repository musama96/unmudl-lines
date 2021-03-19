import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnmudlAccessLogSchema } from './unmudl-access-log.model';
import { UnmudlAccessLogsController } from './unmudl-access-logs.controller';
import { UnmudlAccessLogsService } from './unmudl-access-logs.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'unmudl-access-logs', schema: UnmudlAccessLogSchema }])],
  controllers: [UnmudlAccessLogsController],
  providers: [UnmudlAccessLogsService],
  exports: [UnmudlAccessLogsService],
})
export class UnmudlAccessLogsModule {}
