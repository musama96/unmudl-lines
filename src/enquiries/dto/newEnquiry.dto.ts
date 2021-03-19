import { IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export enum MessageFrom {
  USER = 'user',
  ADMIN = 'admin',
}

export enum MessageStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export class NewEnquiryDto {
  @IsMongoId(false, { message: responseMessages.common.invalidLearnerId })
  learner: string;

  @IsMongoId(false, { message: responseMessages.common.invalidCourseId })
  course: string;

  @ApiHideProperty()
  from?: MessageFrom;

  @IsNotEmpty({ message: 'Message cannot be empty' })
  message: string;

  @ApiHideProperty()
  @IsOptional()
  collegeRep?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsEnum(MessageStatus)
  @ApiProperty({ default: MessageStatus.UNREAD })
  status?: MessageStatus;
}
