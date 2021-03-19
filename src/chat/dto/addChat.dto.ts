import responseMessages from '../../config/responseMessages';
import { IsMongoId, IsArray } from '../../common/validators';
import { ApiHideProperty } from '@nestjs/swagger';
import { ChatType } from '../chat.model';
import { IsEnum, IsOptional } from 'class-validator';
import { ChatModuleEnum } from './chatList.dto';

export class AddChatDto {
  groupName?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  course?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidCourseId })
  college?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidEmployerId })
  employer?: string;

  @IsMongoId(true, { message: responseMessages.common.invalidLearnerIds })
  learner?: string;

  @IsArray(true, { message: responseMessages.common.invalidUserIds })
  @IsMongoId(true, { message: responseMessages.common.invalidUserIds, each: true })
  users?: string[];

  @IsArray(true, { message: responseMessages.common.invalidEmployerAdminIds })
  @IsMongoId(true, { message: responseMessages.common.invalidEmployerAdminIds, each: true })
  employerAdmins?: string[];

  @IsOptional()
  @IsEnum(ChatModuleEnum, { message: responseMessages.addChat.module })
  module?: ChatModuleEnum;

  @IsMongoId(true, { message: responseMessages.addChat.moduleDocumentId })
  moduleDocumentId?: string;

  @ApiHideProperty()
  createdBy?: string;

  @ApiHideProperty()
  createdByType?: string;

  @ApiHideProperty()
  showToCreator?: boolean;

  type?: ChatType;
}
