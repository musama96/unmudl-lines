import CoordinatesDto from '../../common/dto/coordinates.dto';
import { StateDto } from '../../common/dto/state.dto';
import { Gender } from '../learner.model';
export declare class CreateLearnerDto {
    readonly firstname: string;
    readonly lastname: string;
    fullname?: string;
    profilePhoto?: string;
    primarySignup?: string;
    readonly phoneNumber?: string;
    readonly emailAddress?: string;
    address?: string;
    coordinates?: CoordinatesDto;
    city?: string;
    state?: StateDto;
    country?: string;
    zip: string;
    password: string;
    isVerified?: boolean;
    gender?: Gender;
}
