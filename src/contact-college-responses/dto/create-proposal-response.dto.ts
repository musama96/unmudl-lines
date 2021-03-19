import { IsArray, IsMongoId } from '../../common/validators';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class CreateProposalResponseDto {
  @ApiProperty()
  @IsArray(false, { message: responseMessages.common.invalidUserIds })
  @IsMongoId(true, { each: true, message: responseMessages.common.invalidUserIds })
  users?: string[];

  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidContactCollegeProposalId })
  proposal?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  attachments?: any;

  @ApiHideProperty()
  college?: string;

  @ApiHideProperty()
  appliedBy?: string;

  @ApiHideProperty()
  proposedBy?: string;

  @ApiHideProperty()
  chat?: string;
}
