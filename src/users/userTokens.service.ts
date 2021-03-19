import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserToken } from './userToken.model';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { UsersService } from './users.service';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectModel('UserToken') private readonly userTokenModel: Model<UserToken>,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
  ) {}

  async createUserToken(userId: string): Promise<string> {
    const token = await this.usersService.getHash(userId);
    const newUserToken = new this.userTokenModel({
      userId,
      token: encodeURIComponent(token),
    });
    const result = await newUserToken.save();
    return result.token;
  }

  async verifyToken(userToken: ResetPasswordDto, remove = false) {
    const token = await this.userTokenModel
      .findOne({ token: userToken.token })
      .lean()
      .exec();

    if (remove) {
      await this.userTokenModel.deleteOne({ token: userToken.token }).exec();
    }

    return token;
  }
}
