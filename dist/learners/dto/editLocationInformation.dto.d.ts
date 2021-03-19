import { StateDto } from '../../common/dto/state.dto';
import CoordinatesDto from '../../common/dto/coordinates.dto';
export declare class EditLocationInformationDto {
    address?: string;
    coordinates?: CoordinatesDto;
    city?: string;
    state?: StateDto;
    country?: string;
    zip: string;
}
