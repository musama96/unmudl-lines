import { IsEmail, IsString, IsBoolean, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class CollegeInvitationDto {
  @IsString({ message: responseMessages.inviteUser.fullname })
  fullname: string;

  @IsString()
  title: string;

  @IsEmail({}, { message: responseMessages.inviteUser.emailAddress })
  emailAddress: string;

  @IsBoolean()
  domainSignup: boolean;

  // @IsNumber()
  commission: number;

  @IsMongoId(false)
  group: string;

  @ApiHideProperty()
  invitedBy?: string;

  @ApiHideProperty()
  collegeId?: string;
}
