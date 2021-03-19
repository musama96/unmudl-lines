import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export enum Status {
  Pending = 'pending',
  Draft = 'draft',
  Published = 'published',
  Unpublished = 'unpublished',
  Featured = 'featured',
  Submitted = 'submitted',
}

export class BlogsListDto {
  @IsOptional()
  @IsEnum(Status, { message: responseMessages.createBlog.status })
  status?: Status;

  @IsOptional()
  @IsString({ message: responseMessages.common.invalidKeyword })
  keyword?: string;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page?: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage?: number;

  sortOrder?: string;
  sortBy?: string;

  @ApiHideProperty()
  collegeId?: string;
  @ApiHideProperty()
  employerId?: string;
}
