import { IsMongoId } from '../../common/validators';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class GetEmployerDashboardDto {
  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  employerId?: string;

  @ApiProperty({ default: new Date().toISOString() })
  @IsDateString()
  countStart?: string;

  @ApiProperty({ default: new Date().toISOString() })
  @IsDateString()
  countEnd?: string;

  @ApiHideProperty()
  employerAdminId?: string;
}
