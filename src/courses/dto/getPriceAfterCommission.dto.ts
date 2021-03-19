import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators/index';
import { IsNumber } from 'class-validator';

export class GetPriceAfterCommissionDto {
  @ApiProperty()
  @IsMongoId(false)
  collegeId: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  isDisplayPrice: boolean;
}
