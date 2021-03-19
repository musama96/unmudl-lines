import {  IsOptional, IsString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId, IsArray } from '../../common/validators';

export class CreatePostDto {
  @ApiHideProperty()
  author?: string;

  @IsString()
  topic: string;

  @ApiProperty({ type: String, description: 'Provide in form of array of strings.' })
  @IsArray(true)
  @IsMongoId(true, { message: responseMessages.post.tags, each: true })
  tags?: string[];

  @ApiProperty({ type: String, description: 'Provide in form of array of strings.' })
  @IsOptional()
  @IsArray(true)
  @IsString({ each: true })
  stringTags?: string[];

  @IsString()
  content: string;

  @ApiHideProperty()
  numId?: number;
}
