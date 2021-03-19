import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class GroupIdDto {
  @IsMongoId(false, { message: responseMessages.addPartnerGroup.id })
  groupId: string;
}
