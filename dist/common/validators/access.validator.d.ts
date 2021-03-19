import { User } from '../../users/user.model';
export declare function isAuthorized(userToUpdate: User, requestingUser: User): {
    isAuthorized: boolean;
    msg: string;
} | {
    isAuthorized: boolean;
    msg?: undefined;
};
