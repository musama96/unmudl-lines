import { Module } from '@nestjs/common';
import { TaxRatesController } from './tax-rates.controller';
import { TaxRatesService } from './tax-rates.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxRatesSchema } from './tax-rate.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'tax-rates', schema: TaxRatesSchema }])],
  controllers: [TaxRatesController],
  providers: [TaxRatesService],
  exports: [TaxRatesService],
})
export class TaxRatesModule {}
