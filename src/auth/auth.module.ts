import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LearnersModule } from '../learners/learners.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { RolesGuard } from './roles.guard';
import { CollegesModule } from '../colleges/colleges.module';
import { CollegeSchema } from '../colleges/college.model';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerAdminsModule } from '../employer-admins/employer-admins.module';
import { RestrictCollegeUserGuard } from './restrictCollegeUser.guard';
import { EmployerSubscriptionsModule } from '../employer-subscriptions/employer-subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'colleges', schema: CollegeSchema }]),
    UsersModule,
    LearnersModule,
    CollegesModule,
    EmployerAdminsModule,
    EmployerSubscriptionsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '31536000s' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, RestrictCollegeUserGuard],
  exports: [AuthService, JwtStrategy, JwtModule, PassportModule, RolesGuard, RestrictCollegeUserGuard],
  controllers: [AuthController],
})
export class AuthModule {}
