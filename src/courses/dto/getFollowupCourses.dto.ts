import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FollowUpCoursesDto {
  @ApiProperty({ required: false, default: '' })
  @IsOptional()
  @IsString({ message: 'You must enter a string to search.' })
  keyword?: string;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: 'You must enter a number.' })
  perPage?: number;
}
