import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from '../../common/validators';
import { IsNotEmpty } from 'class-validator';

export class CancelCourseDto {
  @ApiProperty()
  @IsArray(false)
  reasons: string[];

  @ApiProperty({ required: true })
  password?: string;
}
