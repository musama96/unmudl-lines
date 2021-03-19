import { Model } from 'mongoose';
import { UserToken } from './userToken.model';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { UsersService } from './users.service';
export declare class UserTokensService {
    private readonly userTokenModel;
    private readonly usersService;
    constructor(userTokenModel: Model<UserToken>, usersService: UsersService);
    createUserToken(userId: string): Promise<string>;
    verifyToken(userToken: ResetPasswordDto, remove?: boolean): Promise<any>;
}
