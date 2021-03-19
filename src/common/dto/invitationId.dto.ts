import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

export class InvitationIdDto {
  @IsMongoId(false, { message: responseMessages.common.invitationId })
  invitationId?: string;
}
