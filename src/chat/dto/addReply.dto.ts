import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class AddChatReplyDto {
  @ApiProperty({ required: true })
  @IsMongoId(false, { message: responseMessages.common.invalidEnquiryId })
  chat?: string;

  @ApiProperty({ required: false })
  // @IsNotEmpty({ message: responseMessages.common.requiredMessage })
  message?: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  attachments?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({ message: responseMessages.addChat.showToCreator })
  showToCreator?: boolean;

  @ApiHideProperty()
  employerAdmin?: string;

  @ApiHideProperty()
  learner?: string;

  @ApiHideProperty()
  user?: string;

  @ApiHideProperty()
  readByLearner?: boolean;

  @ApiHideProperty()
  readByUsers?: string[];

  @ApiHideProperty()
  readByEmployerAdmins?: string[];

  @ApiHideProperty()
  _id?: string;
}
