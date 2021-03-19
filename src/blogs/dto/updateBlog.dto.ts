import { IsEnum, IsOptional, IsString, MaxLength, IsDateString, IsNumber } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';
import { IsMongoId, IsArray } from '../../common/validators';

enum PublishStatus {
  PENDING = 'pending',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  DENIED = 'denied',
}

export class UpdateBlogDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  headerImage?: any;

  // @ApiProperty({ type: 'string', format: 'binary' })
  // headerImageThumbnail?: any;
  @ApiHideProperty()
  headerImageThumbnail?: string;

  @ApiProperty({ description: 'Only for unmudl admins.', default: 1 })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.createBlog.featured })
  featured?: number;

  // @ApiHideProperty()
  // author?: string;

  @IsString({ message: responseMessages.createBlog.title })
  title: string;

  @IsMongoId(false, { message: responseMessages.common.invalidBlogId })
  _id?: string;

  @IsOptional()
  @IsString({ message: responseMessages.createBlog.altText })
  altText?: string;

  @ApiProperty({ example: ['mongodb users id', 'mongodb users id'] })
  @IsArray(true, { message: responseMessages.createBlog.contributors })
  @IsMongoId(true, { message: responseMessages.createBlog.contributors, each: true })
  contributors?: any;

  @IsArray(true, { message: responseMessages.createBlog.employerContributors })
  @IsMongoId(true, { message: responseMessages.createBlog.employerContributors, each: true })
  employerContributors?: string[];

  // @IsOptional()
  // @IsUrl({}, {message: responseMessages.createBlog.permalink})
  // permalink?: string;

  @IsOptional()
  @ApiProperty({ example: ['mongodb blog-tag id', 'mongodb blog-tag id'] })
  @IsArray(true, { message: responseMessages.createBlog.tags })
  @IsString({ message: responseMessages.createBlog.tags, each: true })
  tags?: any;

  @IsString({ message: responseMessages.createBlog.content })
  content: string;

  @IsString()
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MaxLength(500)
  tagline: string;

  @IsEnum(PublishStatus, { message: responseMessages.createBlog.status })
  status?: string;

  @ApiHideProperty()
  collegeId?: string;
  @ApiHideProperty()
  employerId?: string;

  @IsOptional()
  @IsDateString()
  publishDate?: string;
}
