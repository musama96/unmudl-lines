import { Controller, Body, UseGuards, Post, HttpCode, Query, Get, Delete, Param, Header } from '@nestjs/common';
import { CollegeInvitationsService } from './college-invitations.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CollegeInvitationDto } from './dto/college-invitation.dto';
import { GetUser } from '../auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import ResponseHandler from '../common/ResponseHandler';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from '../users/users.service';
import { PartnerRequestsService } from '../partner-requests/partner-requests.service';
import { CollegeInvitationIdDto } from './dto/collegeInvitationId.dto';
import { EmployerInvitationsService } from '../employer-invitations/employer-invitations.service';
import { EmployerRequestsService } from '../employer-requests/employer-requests.service';

@ApiTags('College Invitations')
@Controller('college-invitations')
export class CollegeInvitationsController {
  constructor(
    private readonly collegeInvitationsService: CollegeInvitationsService,
    private readonly usersService: UsersService,
    private readonly partnerRequestsService: PartnerRequestsService,
    private readonly employerInvitationsService: EmployerInvitationsService,
    private readonly employerRequestsService: EmployerRequestsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'get paginated list of college invites.' })
  @Get('admin-home')
  async GetCollegeInvitesAndRequest(@Query() paginationDto: PaginationDto) {
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    const invitationParams = {
      ...paginationDto,
      sortBy: 'title',
      sortOrder: '1',
    };
    const requestsParams = {
      ...paginationDto,
      sortBy: 'collegeName',
      sortOrder: '1',
    };
    const employerRequestsParams = {
      ...paginationDto,
      sortBy: 'employerName',
      sortOrder: '1',
    };

    const [invitedPartners, partnerRequests, invitedEmployers, employerRequests] = await Promise.all([
      this.collegeInvitationsService.getCollegeInvitations(invitationParams),
      this.partnerRequestsService.getPartnerRequests(requestsParams),
      this.employerInvitationsService.getEmployerInvitations(invitationParams),
      this.employerRequestsService.getEmployerRequests(employerRequestsParams),
    ]);

    return ResponseHandler.success({
      invitedPartners: invitedPartners.data,
      partnerRequests: partnerRequests.data,
      invitedEmployers: invitedEmployers.data,
      employerRequests: employerRequests.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'get paginated list of college invites.' })
  @Get()
  async GetCollegeInvites(@Query() paginationDto: PaginationDto) {
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.collegeInvitationsService.getCollegeInvitations(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get list of college invites as csv.' })
  @Get('csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=College Invites.csv')
  async GetCollegeInvitesCsv(@Query() paginationDto: PaginationDto) {
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.collegeInvitationsService.getCollegeInvitationsCsv(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Invite college to unmudl.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  async InviteCollege(@Body() collegeInvitaionDto: CollegeInvitationDto, @GetUser() user) {
    const existingInvitaion = await this.collegeInvitationsService.checkExistingInvitationByCollegeName(collegeInvitaionDto.title);

    if (existingInvitaion) {
      return ResponseHandler.fail('Invitation by this college name already exists.', { titleExists: 'title Exists' });
    }

    const existingUser = await this.usersService.checkIfEmailExists(collegeInvitaionDto.emailAddress.toLowerCase());

    if (existingUser.data) {
      return ResponseHandler.fail('User by this email already exists.', { emailExists: 'email Exists' });
    }

    collegeInvitaionDto.invitedBy = user._id;
    collegeInvitaionDto.domainSignup = collegeInvitaionDto.domainSignup ? collegeInvitaionDto.domainSignup : false;
    return await this.collegeInvitationsService.createInvitation(collegeInvitaionDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Resend college invitation mail.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('resend')
  async ResendCollegeInvite(@Body() collegeInvitationIdDto: CollegeInvitationIdDto) {
    return await this.collegeInvitationsService.resendInvitationEmail(collegeInvitationIdDto.invitationId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Resend college invitation mail.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('toggle-suspend')
  async SuspendUnsuspendCollegeInvite(@Body() collegeInvitationIdDto: CollegeInvitationIdDto) {
    return await this.collegeInvitationsService.toggleSuspend(collegeInvitationIdDto.invitationId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Resend college invitation mail.' })
  @Delete(':invitationId')
  async DeleteCollegeInvite(@Param() collegeInvitationIdDto: CollegeInvitationIdDto) {
    return await this.collegeInvitationsService.deleteInvitation(collegeInvitationIdDto.invitationId);
  }
}
