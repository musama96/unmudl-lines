import { IsMongoId, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class BlogNumIdDto {
  @ApiProperty({ description: 'use numeric Id.' })
  // @IsNumber()
  blogId: number;
}
