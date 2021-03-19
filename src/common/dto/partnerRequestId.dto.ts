import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class PartnerRequestIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.partnerRequestId })
  partnerRequestId: string;
}
