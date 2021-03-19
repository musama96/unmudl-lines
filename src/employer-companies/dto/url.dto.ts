import { IsUrl, IsOptional } from 'class-validator';
import responseMessages from '../../config/responseMessages';

export default class UrlDto {
  @IsOptional()
  @IsUrl({}, { message: responseMessages.url.invalidWebsiteUrl })
  website?: string;

  @IsOptional()
  @IsUrl({}, { message: responseMessages.url.invalidFacebookUrl })
  facebook?: string;

  @IsOptional()
  @IsUrl({}, { message: responseMessages.url.invalidTwitterUrl })
  twitter?: string;

  @IsOptional()
  @IsUrl({}, { message: responseMessages.url.invalidLinkedInUrl })
  linkedIn?: string;
}
