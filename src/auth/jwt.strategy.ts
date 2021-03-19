import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { JwtPayLoad } from './jwt.payload.interface';
import { UsersService } from '../users/users.service';
import { LearnersService } from '../learners/learners.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly learnersService: LearnersService,
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly employerSubscriptionsService: EmployerSubscriptionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayLoad) {
    const { emailAddress, _id } = payload;
    const { type } = payload;
    let response: any = {};

    if (type !== 'user' && type !== 'employer') {
      response = await this.learnersService.getLearnerById(_id);
      // @ts-ignore
      response.type = 'learner';
    } else if (type === 'employer') {
      response = await this.employerAdminsService.getAdminByEmail(emailAddress);
      const { data: subscription } = await this.employerSubscriptionsService.getActiveSubscription(response.employerId);
      response.subscription = subscription;
      // @ts-ignore
      response.type = 'employer';
    } else {
      response = await this.usersService.getUserByEmail(emailAddress);
      // @ts-ignore
      response.type = 'user';
    }
    const user = response;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
