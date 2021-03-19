import { IsEmail, IsEnum, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty } from '@nestjs/swagger';
import { UserRoles } from '../../users/user.model';
import { IsMongoId } from '../../common/validators';

export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  INSTRUCTOR = 'instructor',
  MANAGER = 'manager',
  SUPERADMIN = 'superdamin',
}

export class InviteUserDto {
  @IsString({ message: responseMessages.inviteUser.fullname })
  fullname: string;

  @IsEmail({}, { message: responseMessages.inviteUser.emailAddress })
  emailAddress: string;

  @IsEnum(UserRoles, { message: responseMessages.inviteUser.role })
  role: UserRoles;

  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  courseId?: string;

  @ApiHideProperty()
  invitedBy?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidCollegeId })
  collegeId?: string;
}
