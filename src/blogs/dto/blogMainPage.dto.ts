import {IsEnum, IsIn, IsNumber, IsOptional, IsString} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiProperty} from '@nestjs/swagger';

export class  BlogMainPageDto {
  @ApiProperty({ required: false, default: '3' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  sideBarBlogsPerpage?: number;
}
