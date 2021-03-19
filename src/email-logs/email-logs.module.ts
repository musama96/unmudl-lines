import { Module } from '@nestjs/common';
import { EmailLogsController } from './email-logs.controller';
import { EmailLogsService } from './email-logs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailLogSchema } from './email-logs.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'email-logs', schema: EmailLogSchema },
    ]),
  ],
  controllers: [EmailLogsController],
  providers: [EmailLogsService],
  exports: [EmailLogsService]
})
export class EmailLogsModule {}
