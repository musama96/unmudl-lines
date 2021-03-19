import { IsMongoId, IsString, IsNumber } from 'class-validator';
import responseMessages from '../../config/responseMessages';
import { ApiProperty } from '@nestjs/swagger';

export class InstructorNumIdDto {
  @ApiProperty({ description: 'Send numeric Id' })
  // @IsNumber()
  instructorId: string;
}
