import { IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from '../../common/validators';

export class UpdateLandingBlogsDto {
  @ApiProperty({ type: String })
  @IsArray(false, { message: responseMessages.updateLanding.blogs })
  @IsMongoId(false, { message: responseMessages.updateLanding.blogs, each: true })
  blogs: string[];

  @IsString()
  blogsTitle: string;

  @IsString()
  blogsDescription: string;
}
