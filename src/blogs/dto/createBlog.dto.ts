import {  IsEnum, IsNumber, IsOptional, IsString, MaxLength, ArrayMinSize, IsDateString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { BlogStatus } from '../../common/enums/createBlog.enum';
import { IsMongoId, IsArray } from '../../common/validators';

export class CreateBlogDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  headerImage?: any;

  // @ApiProperty({ type: 'string', format: 'binary' })
  // headerImageThumbnail?: any;
  @ApiHideProperty()
  headerImageThumbnail?: string;

  @ApiHideProperty()
  author?: string;
  @ApiHideProperty()
  employerAuthor?: string;

  @ApiHideProperty()
  collegeId?: string;

  @ApiHideProperty()
  employerId?: string;

  @ApiHideProperty()
  type?: string;

  @IsString({ message: responseMessages.createBlog.title })
  title: string;

  @ApiProperty({ description: 'Only for unmudl admins.', default: 1 })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.createBlog.featured })
  featured?: number;

  @IsOptional()
  @IsString({ message: responseMessages.createBlog.altText })
  altText?: string;

  @IsArray(true, { message: responseMessages.createBlog.contributors })
  @IsMongoId(true, { message: responseMessages.createBlog.contributors, each: true })
  contributors?: string[];

  @IsArray(true, { message: responseMessages.createBlog.employerContributors })
  @IsMongoId(true, { message: responseMessages.createBlog.employerContributors, each: true })
  employerContributors?: string[];

  // @IsOptional()
  // @IsUrl({}, {message: responseMessages.createBlog.permalink})
  // permalink?: string;

  @IsOptional()
  @IsArray(true, { message: responseMessages.createBlog.tags })
  @ArrayMinSize(1)
  @IsString({ message: responseMessages.createBlog.tags, each: true })
  tags?: string[];

  @IsString({ message: responseMessages.createBlog.content })
  content: string;

  @IsString()
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MaxLength(500)
  tagline: string;

  @IsEnum(BlogStatus, { message: responseMessages.createBlog.status })
  status?: BlogStatus;

  @IsOptional()
  @IsDateString()
  publishDate?: string;
}
