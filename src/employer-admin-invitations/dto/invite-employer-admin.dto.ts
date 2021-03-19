import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { UserRoles } from '../../users/user.model';
import { IsMongoId } from '../../common/validators';

export enum EmployerAdminRole {
  RECRUITER = 'recruiter',
  ADMIN = 'admin',
  SUPERADMIN = 'superdamin',
}

export class InviteEmployerAdminDto {
  @IsString({ message: responseMessages.inviteUser.fullname })
  fullname: string;

  @IsEmail({}, { message: responseMessages.inviteUser.emailAddress })
  emailAddress: string;

  @IsEnum(EmployerAdminRole, { message: responseMessages.inviteEmployerAdmin.role })
  role: EmployerAdminRole;

  @ApiHideProperty()
  invitedBy?: string;

  @ApiHideProperty()
  employerAdminId?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  employerId?: string;
}
