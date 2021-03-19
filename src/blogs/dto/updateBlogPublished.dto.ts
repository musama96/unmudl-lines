import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId } from '../../common/validators';

enum PublishedStatus {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  DENIED = 'denied',
}

export class UpdateBlogPublishedDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidBlogId })
  blogId: string;

  @ApiProperty()
  @IsEnum(PublishedStatus, { message: responseMessages.updateBlog.publishedStatus })
  status: PublishedStatus;
}
