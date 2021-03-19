import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class RefundRequestIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidRefundRequestId })
  refundRequestId: string;
}
