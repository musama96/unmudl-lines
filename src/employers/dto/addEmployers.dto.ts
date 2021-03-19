import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Employer } from './employer.dto';
import { IsArray } from '../../common/validators';

export class AddEmployerDto {
  @ApiProperty({ default: '[{"title": "employer", "website": "employer.com" }]' })
  @IsArray(false)
  @ValidateNested({ each: true })
  @Type(() => Employer)
  employers: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  employersLogos: any;
}
