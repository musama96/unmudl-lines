import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllIndustriesDto {
  @ApiProperty()
  keyword?: string;

  @ApiProperty()
  sortBy?: string;

  @ApiProperty()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}
