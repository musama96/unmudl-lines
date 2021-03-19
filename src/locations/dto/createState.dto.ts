import { IsString, IsNumber } from 'class-validator';
// import responseMessages from '../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStateDto {
  @ApiProperty()
  @IsString()
  abbreviation: string;

  @ApiProperty()
  // @IsNumber()
  longitude: number;

  @ApiProperty()
  // @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsString()
  name: string;
}
