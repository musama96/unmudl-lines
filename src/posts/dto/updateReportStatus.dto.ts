import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PostReportStatus } from '../post-report.model';
import { IsMongoId } from '../../common/validators';

export class UpdateReportStatusDto {
  @ApiProperty({ description: 'Id of the report' })
  @IsMongoId(false)
  reportId: string;

  @IsEnum(PostReportStatus)
  status: PostReportStatus;
}
