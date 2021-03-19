import {ApiHideProperty} from '@nestjs/swagger';
import {IsEnum, IsNotEmpty} from 'class-validator';
import responseMessages from '../../config/responseMessages';
import {Severity} from '../../common/enums/createBugReport.enum';

export class CreateBugReportDto {
  @IsNotEmpty({message: responseMessages.createBugReport.title})
  title: string;

  @IsEnum(Severity, {message: responseMessages.createBugReport.severity})
  severity: Severity;

  description?: string;
  comment?: string;

  @ApiHideProperty()
  reportedBy?: string;
}
