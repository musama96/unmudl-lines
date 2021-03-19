import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';
import { InstructorCoursesColumns, InstructorCoursesOrder } from '../../common/enums/sort.enum';
import { IsMongoId } from '../../common/validators';

export class InstructorCoursesListDto {
  @ApiProperty()
  @IsMongoId(false, { message: responseMessages.common.invalidUserId })
  userId: string;

  @ApiProperty()
  @IsEnum(InstructorCoursesColumns)
  column: InstructorCoursesColumns;

  @ApiProperty()
  @IsEnum(InstructorCoursesOrder)
  order: InstructorCoursesOrder;

  @ApiProperty({ required: false, default: '1' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPage })
  page: number;

  @ApiProperty({ required: false, default: '10' })
  @IsOptional()
  // @IsNumber({}, { message: responseMessages.common.invalidPerPage })
  perPage: number;
}
