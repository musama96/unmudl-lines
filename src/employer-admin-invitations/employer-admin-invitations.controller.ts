import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerAdminInvitationsService } from './employer-admin-invitations.service';
import { EmployerAdminRole, InviteEmployerAdminDto } from './dto/invite-employer-admin.dto';
import { ListDto } from '../common/dto/list.dto';
import { EmployerAdminInvitationIdDto } from '../common/dto/employerAdminInvitationId.dto';
import responseMessages from '../config/responseMessages';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { StripeService } from '../stripe/stripe.service';
import { ChatService } from '../chat/chat.service';

@ApiTags('Admin Portal - Employer Admin Invitations')
@Controller('employer-admin-invitations')
export class EmployerAdminInvitationsController {
  constructor(
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly employerAdminInvitationsService: EmployerAdminInvitationsService,
    private readonly stripeService: StripeService,
    private readonly chatService: ChatService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get employer admin invitations list' })
  @Get()
  async getAdminInvitations(@Query() listDto: ListDto, @GetUser() user) {
    listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    return await this.employerAdminInvitationsService.getAdminInvitations(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get employer admin invitations list' })
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=Employer Admin Invitations.csv')
  @Get('csv')
  async getAdminInvitationsCsv(@Query() listDto: ListDto, @GetUser() user) {
    listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    return await this.employerAdminInvitationsService.getAdminInvitationsCsv(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete employer admin invitation.' })
  @Delete(':invitationId')
  async removeAdminInvitation(@Param() employerAdminInvitationIdDto: EmployerAdminInvitationIdDto) {
    return await this.employerAdminInvitationsService.removeAdminInvitation(employerAdminInvitationIdDto.invitationId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Invite employer admin.' })
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async inviteEmployerAdmin(@Body() inviteEmployerAdminDto: InviteEmployerAdminDto, @GetUser() user): Promise<SuccessInterface> {
    inviteEmployerAdminDto.invitedBy = user._id;
    inviteEmployerAdminDto.employerId = user.employerId ? user.employerId : inviteEmployerAdminDto.employerId;

    const { data: invitedAdmins } = await this.employerAdminInvitationsService.getEmployerAdminInvitationCount(
      inviteEmployerAdminDto.employerId,
    );

    const {
      subscription: { activePlan },
    } = user;

    if ((activePlan.level === 0 || activePlan.level === 1) && invitedAdmins >= activePlan.accountLimit) {
      return ResponseHandler.fail(`You have reached you plan's account limit. You cannot invite more admins.`);
    }

    const existingAdmin = await this.employerAdminsService.getAdminByEmail(inviteEmployerAdminDto.emailAddress.toLowerCase());

    if (existingAdmin) {
      return ResponseHandler.fail(
        (existingAdmin.employerId ? existingAdmin.employerId.toString() : '') === (user.employerId ? user.employerId.toString() : '')
          ? responseMessages.inviteEmployerAdmin.adminAlreadyRegistered
          : 'Admin already registered with another employer.',
      );
    }

    if (inviteEmployerAdminDto.role === EmployerAdminRole.SUPERADMIN && user.role !== EmployerAdminRole.SUPERADMIN) {
      return ResponseHandler.fail('Only a super admin can add another super admin.');
    }

    let { data: newAdmin } = await this.employerAdminsService.insertInvitedAdmin(inviteEmployerAdminDto);

    newAdmin = await newAdmin.populate('employerId').execPopulate();
    if (newAdmin.employerId.stripeCustomerId) {
      newAdmin.stripeCustomerId = newAdmin.employerId.stripeCustomerId;
    } else {
      const customerId = await this.stripeService.createCustomer(newAdmin);
      newAdmin.stripeCustomerId = customerId;
      newAdmin.employerId.stripeCustomerId = customerId;
      await newAdmin.employerId.save();
    }
    await newAdmin.save();

    // await this.chatService.initializeContactUnmudlChats(newAdmin);

    const token = await this.employerAdminsService.createEmployerAdminToken(newAdmin._id.toString());
    inviteEmployerAdminDto.employerAdminId = newAdmin._id;
    const { data: invitation } = await this.employerAdminInvitationsService.inviteAdmin(inviteEmployerAdminDto, token);

    // const activities = [
    //   {
    //     type: ActivityTypes.User,
    //     user: mongoose.Types.ObjectId(user._id),
    //     otherUser: mongoose.Types.ObjectId(newAdmin.data._id),
    //     userRole: newAdmin.data.role,
    //     userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(UserActivities.InvitedUser)),
    //   },
    // ];
    //
    // await this.activitiesService.createActivities(activities);

    return ResponseHandler.success({
      invitation, // user: newAdmin.data, // course: course.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Resend employer admin invitation.' })
  @Post('resend')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async resendInvitation(@Body() employerAdminInvitationIdDto: EmployerAdminInvitationIdDto) {
    const { data: invitation } = await this.employerAdminInvitationsService.getInvitationById(employerAdminInvitationIdDto.invitationId);

    if (invitation.status === 'pending') {
      if (invitation.employerAdminId) {
        const token = await this.employerAdminsService.createEmployerAdminToken(invitation.employerAdminId.toString());

        await this.employerAdminInvitationsService.resendInvitation(invitation, token);

        return ResponseHandler.success(null, 'Invitation resent successfully.');
      } else {
        return ResponseHandler.fail('Admin id is missing from the database. Please delete the user and invite him again.');
      }
    } else {
      return ResponseHandler.fail('Admin already accepted invitation.');
    }
  }
}
