import { IsEmail, IsString, IsBoolean } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../config/responseMessages';
import { IsMongoId } from '../common/validators';

export class EmployerInvitationDto {
  @IsString({ message: responseMessages.inviteUser.fullname })
  fullname: string;

  @IsString()
  title: string;

  @IsMongoId(false)
  group: string;

  @IsBoolean()
  domainSignup: boolean;

  @IsEmail({}, { message: responseMessages.inviteUser.emailAddress })
  emailAddress: string;

  @ApiHideProperty()
  invitedBy?: string;

  @ApiHideProperty()
  employerId?: string;
}
