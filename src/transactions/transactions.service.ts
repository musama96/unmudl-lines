import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel('transactions') private readonly transactionModel,
  ) {}

  async addTransaction(details) {
    let newTransaction = await this.transactionModel(details);

    newTransaction = await newTransaction.save();

    return newTransaction;
  }
}
