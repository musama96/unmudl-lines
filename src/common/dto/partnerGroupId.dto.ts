import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class PartnerGroupIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidPartnerGroupId })
  partnerGroupId: string;
}
