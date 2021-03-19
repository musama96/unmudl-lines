import { IsString, IsUrl, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class GetAnchorsDto {
  @IsString()
  elementID: string;

  // @IsNumber()
  @IsOptional()
  limit?: number;
}
