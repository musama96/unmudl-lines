import UrlDto from './url.dto';
import ContactDto from './contact.dto';
export declare class UpdateCollegeDto {
    collegeLogo?: any;
    collegeLogoPath?: string;
    collegeBanner?: any;
    collegeBannerPath?: string;
    collegeLogoThumbnail?: string;
    description?: string;
    communityCollegeId?: string;
    _id?: string;
    title?: string;
    address?: string;
    streetAddress?: string;
    city?: string;
    zip?: string;
    timeZone?: string;
    country?: string;
    url?: UrlDto;
    contact?: ContactDto;
}
