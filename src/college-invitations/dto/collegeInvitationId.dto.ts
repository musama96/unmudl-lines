import { IsMongoId } from '../../common/validators';

export class CollegeInvitationIdDto {
  @IsMongoId(false)
  invitationId?: string;
}
