import {IsArray, IsBoolean, IsEnum, IsIn, IsMongoId, IsNumber, IsOptional, IsString} from 'class-validator';
import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import responseMessages from '../../config/responseMessages';

export class AddTagDto {

  @IsString()
  title: string;

}
