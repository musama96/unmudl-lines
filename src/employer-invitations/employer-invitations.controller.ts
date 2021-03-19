import { Body, Controller, HttpCode, Post, UseGuards, Get, Query, Header, Delete, Param } from '@nestjs/common';
import { EmployerInvitationsService } from './employer-invitations.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerInvitationDto } from './employer-invitation.dto';
import ResponseHandler from '../common/ResponseHandler';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CollegeInvitationIdDto } from '../college-invitations/dto/collegeInvitationId.dto';

@ApiTags('Admin Portal - Employer Invitations')
@Controller('employer-invitations')
export class EmployerInvitationsController {
  constructor(
    private readonly employerInvitationsService: EmployerInvitationsService,
    private readonly employerAdminsService: EmployerAdminsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Invite employer to unmudl.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  async InviteEmployer(@Body() employerInvitationDto: EmployerInvitationDto, @GetUser() user) {
    const existingInvitation = await this.employerInvitationsService.checkExistingInvitationByEmployerName(employerInvitationDto.title);

    if (existingInvitation) {
      return ResponseHandler.fail('Invitation by this employer name already exists.', { titleExists: 'title Exists' });
    }

    const { data: existingUser } = await this.employerAdminsService.getUserByEmail(employerInvitationDto.emailAddress.toLowerCase());

    if (existingUser) {
      return ResponseHandler.fail('Employer admin by this email already exists.', { emailExists: 'email Exists' });
    }

    employerInvitationDto.invitedBy = user._id;
    return await this.employerInvitationsService.createInvitation(employerInvitationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get employer invites.' })
  @Get()
  async GetEmployerInvites(@Query() paginationDto: PaginationDto) {
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 10;
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.employerInvitationsService.getEmployerInvitations(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get list of college invites as csv.' })
  @Get('csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=College Invites.csv')
  async GetEmployerInvitesCsv(@Query() paginationDto: PaginationDto) {
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.sortOrder = paginationDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.employerInvitationsService.getEmployerInvitationsCsv(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Resend college invitation mail.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('resend')
  async ResendCollegeInvite(@Body() collegeInvitationIdDto: CollegeInvitationIdDto) {
    return await this.employerInvitationsService.resendInvitationEmail(collegeInvitationIdDto.invitationId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Resend employer invitation mail.' })
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('toggle-suspend')
  async SuspendUnsuspendCollegeInvite(@Body() collegeInvitationIdDto: CollegeInvitationIdDto) {
    return await this.employerInvitationsService.toggleSuspend(collegeInvitationIdDto.invitationId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Delete employer invitation.' })
  @Delete(':invitationId')
  async DeleteCollegeInvite(@Param() collegeInvitationIdDto: CollegeInvitationIdDto) {
    return await this.employerInvitationsService.deleteInvitation(collegeInvitationIdDto.invitationId);
  }
}
