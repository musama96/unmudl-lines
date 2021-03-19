import { IsString, IsNumber } from 'class-validator';
// import responseMessages from '../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  // @IsNumber()
  code: number;
}
