import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';

export class Institution {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
