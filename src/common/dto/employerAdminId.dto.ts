import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class EmployerAdminIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidEmployerAdminId })
  adminId?: string;
}
