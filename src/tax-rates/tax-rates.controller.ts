import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tax Rates')
@Controller('tax-rates')
export class TaxRatesController {}
