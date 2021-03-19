import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from '../../common/validators';

export class AddEnquiryMembersDto {
  @IsMongoId(false)
  enquiryGroupId: string;

  @ApiProperty({ type: String })
  @IsArray(false)
  @IsMongoId(false, { message: responseMessages.common.invalidUserId, each: true })
  users: string[];
}
