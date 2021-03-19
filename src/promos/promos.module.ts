import { Module } from '@nestjs/common';
import { PromosController } from './promos.controller';
import { PromosService } from './promos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoSchema } from './promo.model';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'promos', schema: PromoSchema }]),
    MongooseModule.forFeature([{ name: 'enrollments', schema: EnrollmentSchema }]),
    NotificationsModule,
  ],
  controllers: [PromosController],
  providers: [PromosService],
  exports: [PromosService],
})
export class PromosModule {}
