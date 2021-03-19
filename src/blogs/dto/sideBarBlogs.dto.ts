import {IsEnum, IsIn, IsNumber, IsOptional, IsString, IsBoolean} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {ApiProperty} from '@nestjs/swagger';

export class  SideBarBlogsDto {

  @ApiProperty({ required: false, default: '3' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage?: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  popular: boolean;
}
