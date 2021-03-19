import { Injectable } from '@nestjs/common';
import ResponseHandler from '../common/ResponseHandler';
import {InjectModel} from '@nestjs/mongoose';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectModel('payouts') private readonly PayoutModel,
  ) {}

  async getLastTransactionDate(collegeId) {
    const data = await this.PayoutModel.find({
      collegeId,
    })
      .sort({ createdAt: -1 })
      .exec();

    return ResponseHandler.success(data && data.length > 0 ? data[0].createdAt : null);
  }

  async addPayout(details) {
    let newPayout = new this.PayoutModel({
      status: 'approved',
      amount: details.amount,
      collegeId: details.collegeId,
      collegeUserId: details.userId,
    });
    newPayout = await newPayout.save();

    return ResponseHandler.success(newPayout);
  }
}
