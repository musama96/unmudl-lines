import { IsEnum } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { Status } from '../../common/enums/createPromo.enum';
import { IsMongoId } from '../../common/validators';

export class SuspendPromoDto {
  @IsMongoId(false, { message: responseMessages.common.invalidPromoId })
  _id: string;

  @IsEnum(Status, { message: responseMessages.createPromo.status })
  status: Status;
}
