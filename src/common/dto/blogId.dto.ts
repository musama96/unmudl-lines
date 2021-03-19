import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from '../../common/validators';

export class BlogIdDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidBlogId })
  blogId: string;
}
