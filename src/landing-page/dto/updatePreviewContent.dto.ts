import { ApiProperty } from '@nestjs/swagger';

export class UpdatePreviewContentDto {
  @ApiProperty()
  previewContent?: string;
}
