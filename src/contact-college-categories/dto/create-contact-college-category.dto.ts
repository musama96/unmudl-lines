import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsArray } from '../../common/validators';
import responseMessages from '../../config/responseMessages';

export class CreateContactCollegeCategoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: responseMessages.createContactCollegeCategory.title })
  title?: string;

  @ApiProperty({ example: ['test title'] })
  @IsArray(true, { message: responseMessages.createContactCollegeCategory.subcategoryTitleArr })
  @IsString({ each: true, message: responseMessages.createContactCollegeCategory.subcategoryTitle })
  subcategories?: string[] | any;
}
