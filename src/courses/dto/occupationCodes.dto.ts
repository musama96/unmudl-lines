import { IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from '../../common/validators';

export class OccupationCodesDto {
  @ApiProperty({ type: String, default: '["49-9051.00"]' })
  @IsArray(false)
  @ArrayMinSize(1)
  @IsString({ each: true })
  occupationCodes: string[];
}
