import UrlDto from './url.dto';
import ContactDto from './contact.dto';
import CoordinatesDto from '../../common/dto/coordinates.dto';
import { StateDto } from '../../common/dto/state.dto';
export declare class CreateCollegeDto {
    _id?: string;
    profilePhoto?: any;
    collegeLogo?: any;
    description?: string;
    communityCollegeId?: string;
    coordinates: CoordinatesDto;
    url: UrlDto;
    contact: ContactDto;
    title: string;
    address: string;
    city: string;
    state: StateDto;
    zip: string;
    country: string;
    timezone: string;
}
