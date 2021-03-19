import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class UpdateEmployerAdminRoleDto {
  @ApiProperty()
  @IsIn(['recruiter', 'admin', 'superadmin'], { message: responseMessages.inviteEmployerAdmin.role })
  role: string;

  @ApiHideProperty()
  adminId?: string;
}
