import { IsIn } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../validators/index';

export class UpdateUserRoleDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidUserId })
  userId: string;

  @ApiProperty()
  @IsIn(['admin', 'moderator', 'manager', 'instructor'], { message: responseMessages.updateRole.invalidRole })
  role: string;
}
