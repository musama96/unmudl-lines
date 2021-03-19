import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import {MongooseModule} from '@nestjs/mongoose';
import {TransactionSchema} from './transaction.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'transactions', schema: TransactionSchema }]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
