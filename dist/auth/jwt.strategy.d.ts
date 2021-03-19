import { Strategy } from 'passport-jwt';
import { JwtPayLoad } from './jwt.payload.interface';
import { UsersService } from '../users/users.service';
import { LearnersService } from '../learners/learners.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersService;
    private readonly learnersService;
    private readonly employerAdminsService;
    private readonly employerSubscriptionsService;
    constructor(usersService: UsersService, learnersService: LearnersService, employerAdminsService: EmployerAdminsService, employerSubscriptionsService: EmployerSubscriptionsService);
    validate(payload: JwtPayLoad): Promise<any>;
}
export {};
