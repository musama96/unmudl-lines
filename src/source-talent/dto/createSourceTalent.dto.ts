import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsMongoId } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export enum SourceTalentType {
  LEARNER = 'learner',
  USER = 'user',
}

export class CreateSourceTalentDto {
  @ApiProperty({ required: false })
  title: string;

  @ApiProperty({ required: false })
  message: string;

  @ApiProperty({ required: false })
  @IsEnum(SourceTalentType, { message: responseMessages.createSourceTalent.type })
  type: SourceTalentType;

  @ApiProperty({ required: false })
  @IsMongoId({ message: responseMessages.common.invalidCourseId })
  course: string;

  @ApiHideProperty()
  college?: string;

  @ApiHideProperty()
  employer?: string;

  @ApiHideProperty()
  createdBy?: string;
}
