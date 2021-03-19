import { IsString, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from '../../common/validators';

export class CreateChatGroupDto {
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ type: String })
  @IsArray(false)
  @IsMongoId(false, { message: responseMessages.common.invalidUserId, each: true })
  members: string[];

  @ApiHideProperty()
  createdBy?: string;

  @ApiHideProperty()
  groupPhoto?: string;
}
