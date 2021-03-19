import { Module } from '@nestjs/common';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import {MongooseModule} from '@nestjs/mongoose';
import {PayoutSchema} from './payout.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'payouts', schema: PayoutSchema }]),
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
