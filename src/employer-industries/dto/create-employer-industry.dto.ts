import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateEmployerIndustryDto {
  @ApiProperty()
  @IsNotEmpty()
  title?: string;
}
