import { Module, HttpModule } from '@nestjs/common';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';

@Module({
  controllers: [ExternalController],
  imports: [HttpModule],
  providers: [ExternalService],
  exports: [ExternalService],
})
export class ExternalModule {}
