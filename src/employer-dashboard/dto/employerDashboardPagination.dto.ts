import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class EmployerDashboardPaginationDto {
  @ApiProperty({ required: true, default: '1' })
  @IsNumber()
  page?: number;

  @ApiProperty({ required: true, default: '4' })
  @IsNumber()
  perPage?: number;

  @ApiHideProperty()
  employerAdminId?: string;
}
