import { IsMongoId, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class CollegeNumIdDto {
  @ApiProperty({ description: 'Use numeric Id.' })
  // @IsNumber()
  collegeId: number;
}
