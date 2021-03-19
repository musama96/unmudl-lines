import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class PromoIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidPromoId })
  promoId: string;
}
