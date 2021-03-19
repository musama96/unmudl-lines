import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';

@Injectable()
export class TaxRatesService {
  constructor(@InjectModel('tax-rates') private readonly taxRateModel) {}

  async addTaxRate({ state, postalCode, taxRate }) {
    let newTaxRate = new this.taxRateModel({
      state,
      postalCode,
      taxRate,
    });

    newTaxRate = await newTaxRate.save();

    return ResponseHandler.success(newTaxRate, 'Tax rate added successfully.');
  }

  async getTaxRateByPostalCode(postalCode) {
    const taxRate = await this.taxRateModel
      .findOne({
        postalCode,
      })
      .exec();

    return ResponseHandler.success(taxRate);
  }
}
