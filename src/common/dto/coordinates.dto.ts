import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from '../../common/validators';

export default class CoordinatesDto {
  @ApiProperty({ default: 'Point', required: false })
  @IsString({ message: 'Coordinate type must be "Point".' })
  type: string;

  @IsArray(false, { message: 'Coordinated must be in an array i.e. [lng, lat]' })
  // @IsNumber({}, { message: 'You must enter a valid coordinates i.e. [lng, lat]', each: true })
  coordinates: number[];
}
