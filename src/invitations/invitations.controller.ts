import { Body, Controller, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InviteUserDto, Role } from './dto/inviteUser.dto';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { InvitationsService } from './invitations.service';
import { UsersService } from '../users/users.service';
import responseMessages from '../config/responseMessages';
import { CoursesService } from '../courses/courses.service';
import { CollegesService } from '../colleges/colleges.service';
import { UserTokensService } from '../users/userTokens.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InvitationIdDto } from './dto/invitationId.dto';
import { UserRoles } from '../users/user.model';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityTypes } from '../activities/activity.model';
import * as mongoose from 'mongoose';
import { UserActivities } from '../activities/userActivityCategory.model';
// import { errors } from 'stripe';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly usersService: UsersService,
    private readonly coursesService: CoursesService,
    private readonly collegesService: CollegesService,
    private readonly userTokensService: UserTokensService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user notification preferences.' })
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async InviteUser(@Body() inviteUserDto: InviteUserDto, @GetUser() user): Promise<SuccessInterface> {
    inviteUserDto.invitedBy = user._id;
    inviteUserDto.collegeId = user.collegeId ? user.collegeId : inviteUserDto.collegeId;

    if (inviteUserDto.courseId) {
      inviteUserDto.role = UserRoles.INSTRUCTOR;
      await this.collegesService.checkDomain(inviteUserDto.emailAddress, user.collegeId);
    }

    const existingUser = await this.usersService.checkIfEmailExists(inviteUserDto.emailAddress.toLowerCase());
    // const invitationCheck = await this.invitationsService.getInvitationByEmail(inviteUserDto.emailAddress);

    if (existingUser.data) {
      return ResponseHandler.fail(
        (existingUser.data.collegeId ? existingUser.data.collegeId.toString() : '') === (user.collegeId ? user.collegeId.toString() : '')
          ? responseMessages.inviteUser.userAlreadyRegistered
          : 'User registered in some other college.',
        (existingUser.data.collegeId ? existingUser.data.collegeId.toString() : '') === (user.collegeId ? user.collegeId.toString() : '') &&
          existingUser.data.role === 'instructor'
          ? { user: existingUser }
          : null,
      );
    }

    if (inviteUserDto.role === UserRoles.SUPERADMIN && user.role !== UserRoles.SUPERADMIN) {
      return ResponseHandler.fail('Only superadmin can add another superadmin.');
    }
    // console.log('hi');
    const newUser = await this.usersService.insertInvitedUser(inviteUserDto);
    const token = await this.userTokensService.createUserToken(newUser.data._id.toString());
    const invitation = await this.invitationsService.inviteUser(inviteUserDto, token);
    // const course = await this.coursesService.updateCourseInstructors(inviteUserDto.courseId, newUser.data._id);

    const activities = [
      {
        type: ActivityTypes.User,
        user: mongoose.Types.ObjectId(user._id),
        otherUser: mongoose.Types.ObjectId(newUser.data._id),
        userRole: newUser.data.role,
        userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(UserActivities.InvitedUser)),
      },
    ];

    await this.activitiesService.createActivities(activities);

    return ResponseHandler.success({
      invitation: invitation.data, // user: newUser.data, // course: course.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Resend college invitation mail.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('resend')
  async ResendInvite(@Body() invitationIdDto: InvitationIdDto) {
    return await this.invitationsService.resendInvitationEmail(invitationIdDto.invitationId);
  }
}
