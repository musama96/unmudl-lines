import {ApiHideProperty, ApiProperty} from '@nestjs/swagger';
import {IsDateString, IsEnum, IsOptional} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {UserType} from '../../enrollments/dto/revenueAnalyticsCount.dto';

export class PerformanceIndicatorsDto {
  @ApiProperty({default: new Date()})
  @IsOptional()
  @IsDateString({message: responseMessages.common.invalidStartDate})
  coursesStart?: string;

  @ApiProperty({default: new Date()})
  @IsOptional()
  @IsDateString({message: responseMessages.common.invalidEndDate})
  coursesEnd?: string;

  @ApiProperty({default: new Date()})
  @IsOptional()
  @IsDateString({message: responseMessages.common.invalidStartDate})
  learnersStart?: string;

  @ApiProperty({default: new Date()})
  @IsOptional()
  @IsDateString({message: responseMessages.common.invalidEndDate})
  learnersEnd?: string;

  @ApiProperty({default: new Date()})
  @IsOptional()
  @IsDateString({message: responseMessages.common.invalidStartDate})
  collegesStart?: string;

  @ApiProperty({default: new Date()})
  @IsOptional()
  @IsDateString({message: responseMessages.common.invalidEndDate})
  collegesEnd?: string;

  @ApiProperty({description: 'College can view unmudl analytics if selected.'})
  @IsOptional()
  @IsEnum(UserType, {message: responseMessages.createPromo.type})
  type?: UserType;

  @ApiHideProperty()
  collegeId?: string;
  @ApiHideProperty()
  start?: string;
  @ApiHideProperty()
  end?: string;
}
