import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class EmployerRequestIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.partnerRequestId })
  employerRequestId: string;
}
