import {  IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId, IsArray } from '../../common/validators';

export class EditPostDto {
  // @IsMongoId(false, { message: responseMessages.post.postId })
  @ApiHideProperty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ description: 'Provide in form of array of strings.' })
  @IsArray(true)
  @IsMongoId(true, { message: responseMessages.post.tags, each: true })
  tags?: string;

  @IsString()
  content: string;
}
