import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllCategoriesDto {
  @ApiProperty()
  keyword?: string;

  @ApiProperty()
  sortBy?: string;

  @ApiProperty()
  @IsIn(['asc', 'desc'])
  sortOrder?: string;
}
