import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LearnersService } from '../learners/learners.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from './jwt.payload.interface';
import { AuthCredentialsDto } from './dto/authCredentialsDto';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { Gender, Ethnicity } from '../learners/learner.model';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly learnersService: LearnersService,
    private readonly jwtService: JwtService,
    private readonly employerSubscriptionsService: EmployerSubscriptionsService,
    @InjectModel('colleges') private readonly collegeModel,
  ) {}

  async userLogin(authCredentialsDto: AuthCredentialsDto, isCollegeUser: boolean) {
    const user = await this.usersService.validateUserForLogin(authCredentialsDto);
    if (!user || (isCollegeUser && !user.collegeId) || (!isCollegeUser && user.collegeId)) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    if (user.isSuspended || (user.invitation && user.invitation !== 'accepted')) {
      return ResponseHandler.fail(user.invitation !== 'accepted' ? responseMessages.login.pendingInvite : responseMessages.login.suspended);
    }
    if (user.collegeId && user.collegeId.isSuspended) {
      return ResponseHandler.fail(`Your college's account is suspended by UNMUDL.`);
    }

    await this.usersService.updateLastLoggedIn(user._id);

    const payload: JwtPayLoad = { _id: user._id, emailAddress: user.emailAddress, type: 'user' };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        emailAddress: user.emailAddress,
        profilePhoto: user.profilePhoto,
        profilePhotoThumbnail: user.profilePhotoThumbnail,
        collegeId: user.collegeId ? user.collegeId._id : null,
        college: user.collegeId ? user.collegeId.title : null,
        collegeDomain: user.collegeId ? user.collegeId.domain : null,
        orgId: user.collegeId ? user.collegeId.orgId : null,
        role: user.role,
      },
    };
  }

  async employerLogin(authCredentialsDto: AuthCredentialsDto) {
    const admin = await this.employerAdminsService.validateEmployerAdminForLogin(authCredentialsDto);

    if (admin) {
      if (admin.invitation && admin.invitation !== 'accepted') {
        return ResponseHandler.fail(responseMessages.login.pendingInvite);
      }
      if (admin.isSuspended) {
        return ResponseHandler.fail(responseMessages.login.suspended);
      }
      if (admin.employerId && admin.employerId.isSuspended) {
        return ResponseHandler.fail(`Your employer's account is suspended by UNMUDL.`);
      }

      await this.employerAdminsService.updateLastLoggedIn(admin._id);

      const payload: JwtPayLoad = { _id: admin._id, emailAddress: admin.emailAddress, type: 'employer' };
      const accessToken = this.jwtService.sign(payload);

      const { data: activeSubscription } = await this.employerSubscriptionsService.getActiveSubscription(admin.employerId);

      return {
        accessToken,
        user: {
          _id: admin._id,
          fullname: admin.fullname,
          username: admin.username,
          emailAddress: admin.emailAddress,
          profilePhoto: admin.profilePhoto,
          profilePhotoThumbnail: admin.profilePhotoThumbnail,
          employerId: admin.employerId ? admin.employerId._id : null,
          employer: admin.employerId ? admin.employerId.title : null,
          employerAddress: admin.employerId ? admin.employerId.address : null,
          employerDomain: admin.employerId ? admin.employerId.domain : null,
          employerLogo: admin.employerId ? admin.employerId.employerLogo : null,
          employerBanner: admin.employerId ? admin.employerId.employerBanner : null,
          employerLogoThumbnail: admin.employerId ? admin.employerId.employerLogoThumbnail : null,
          zip: admin.employerId ? admin.employerId.zip : null,
          role: admin.role,
          activeSubscription,
        },
      };
    } else {
      throw new UnauthorizedException('Invalid Credentials');
    }
  }

  async login(authCredentialsDto: AuthCredentialsDto) {
    const user = await this.usersService.validateUserForLogin(authCredentialsDto);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    if (user.isSuspended || (user.invitation && user.invitation !== 'accepted')) {
      return ResponseHandler.fail(user.invitation !== 'accepted' ? responseMessages.login.pendingInvite : responseMessages.login.suspended);
    }
    if (user.collegeId && user.collegeId.isSuspended) {
      return ResponseHandler.fail(`Your college's account is suspended by UNMUDL.`);
    }

    await this.usersService.updateLastLoggedIn(user._id);

    const payload: JwtPayLoad = { _id: user._id, emailAddress: user.emailAddress, type: 'user' };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        emailAddress: user.emailAddress,
        profilePhoto: user.profilePhoto,
        profilePhotoThumbnail: user.profilePhotoThumbnail,
        collegeId: user.collegeId ? user.collegeId._id : null,
        college: user.collegeId ? user.collegeId.title : null,
        collegeDomain: user.collegeId ? user.collegeId.domain : null,
        role: user.role,
      },
    };
  }

  async learnerLogin(authCredentialsDto: AuthCredentialsDto) {
    const learner = await this.learnersService.validateLearnerForLogin(authCredentialsDto);
    if (!learner) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    if (!learner.isVerified) {
      return ResponseHandler.fail(responseMessages.login.unverified);
    }
    if (learner.isSuspended) {
      return ResponseHandler.fail(responseMessages.login.suspended);
    }
    await this.learnersService.updateLastLoggedIn(learner._id);
    const payload: JwtPayLoad = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
    const accessToken = this.jwtService.sign(payload);
    return ResponseHandler.success({
      accessToken,
      learner: {
        _id: learner._id,
        firstname: learner.firstname,
        lastname: learner.lastname,
        fullname: learner.fullname,
        gender: learner.gender ? learner.gender : Gender.PREFER_NOT_TO_RESPOND,
        ethnicity: learner.ethnicity ? learner.ethnicity : Ethnicity.PREFER_NOT_TO_RESPOND,
        profilePhoto: learner.profilePhoto,
        profilePhotoThumbnail: learner.profilePhotoThumbnail,
        emailAddress: learner.emailAddress,
        phoneNumber: learner.phoneNumber,
        address: learner.address,
        city: learner.city,
        state: learner.state,
        country: learner.country,
        zip: learner.zip,
        cartCoursesCount: learner.cart ? learner.cart.length : 0,
        coordinates: learner.coordinates,
        dateOfBirth: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : null,
        primarySignup: learner.primarySignup,
        veteranBenefits: learner.veteranBenefits,
        militaryStatus: learner.militaryStatus,
        isSpouseActive: learner.isSpouseActive,
        militaryBenefit: learner.militaryBenefit,
        wioaBenefits: learner.wioaBenefits,
        createdAt: learner.createdAt,
      },
    });
  }
}
