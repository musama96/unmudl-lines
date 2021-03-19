import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ required: false })
  lat?: number;

  @ApiProperty({ required: false })
  lng?: number;
}
