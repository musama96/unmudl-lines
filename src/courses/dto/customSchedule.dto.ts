import { IsNumber, IsNotEmpty, IsEnum, IsOptional, ArrayMaxSize, IsDateString } from 'class-validator';
import { IntervalType } from '../courses.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from '../../common/validators';

export class CustomSchedule {
  @IsNotEmpty()
  // @IsNumber()
  repeatInterval: number;

  @ApiProperty({ example: 'day' })
  @IsNotEmpty()
  @IsEnum(IntervalType)
  intervalType: string;

  @IsOptional()
  @IsArray(true)
  @ArrayMaxSize(7)
  // @IsNumber({}, { each: true })
  weekdays?: number[];

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  // @IsNumber()
  occurences: number;
}
