import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../validators/index';

export class KeywordDto {
  @ApiProperty({ required: false, default: '' })
  keyword?: string;

  @IsMongoId(true)
  collegeId?: string;
}
