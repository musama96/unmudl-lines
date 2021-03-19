import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';
import {ApiHideProperty} from '@nestjs/swagger';

export class Employer {
  @IsNotEmpty()
  @IsString({message: 'title must be string'})
  title: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiHideProperty()
  logo?: string;
}
