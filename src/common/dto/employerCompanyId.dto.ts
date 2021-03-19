import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class EmployerCompanyIdDto {
  @ApiProperty()
  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  employerId?: string;
}
