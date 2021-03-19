import {IsString} from 'class-validator';
import responseMessages from '../../config/responseMessages';

export class CreateBlogTagDto {
  @IsString({message: responseMessages.createBlogTag.title})
  title: string;
}
