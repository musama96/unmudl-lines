import { IsMongoId } from '../../common/validators';

export class InvitationIdDto {
  @IsMongoId(false)
  invitationId?: string;
}
