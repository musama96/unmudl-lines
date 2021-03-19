import { CreateStateDto } from './dto/createState.dto';
import { CreateCountryDto } from './dto/createCountry.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getStates(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    getCountries(keywordDto: KeywordDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createState(createStateDto: CreateStateDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
    createContry(createCountryDto: CreateCountryDto): Promise<{
        success: boolean;
        status: number;
        data: any;
        message: string;
    }>;
}
