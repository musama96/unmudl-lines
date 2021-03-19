import UrlDto from './url.dto';
export declare class UpdateEmployerCompanyDto {
    employerLogo?: any;
    employerLogoPath?: string;
    employerBanner?: any;
    employerBannerPath?: string;
    employerLogoThumbnail?: string;
    description?: string;
    _id?: string;
    title?: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    url?: UrlDto;
    industries?: string[];
    employerGroup?: string;
}
