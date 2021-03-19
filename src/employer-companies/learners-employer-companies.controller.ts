import { Controller, Get, Body, Query, Param } from '@nestjs/common';
import { SuccessInterface } from '../common/ResponseHandler';
import ResponseHandler from '../common/ResponseHandler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollegeIdDto } from '../common/dto/collegeId.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserIdDto } from '../common/dto/userId.dto';
import { CoursesService } from '../courses/courses.service';
import { LearnerNumIdDto } from '../common/dto/learnerNumId.dto';
import { CollegeNumIdDto } from '../common/dto/collegeNumId.dto';
import { InstructorNumIdDto } from '../common/dto/instructorNumId.dto';
import { EmployerCompaniesService } from './employer-companies.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { EmployerInvitationsService } from '../employer-invitations/employer-invitations.service';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('Learners Portal - Employers')
@Controller('/learners/employer-companies')
export class LearnersEmployerCompaniesController {
  constructor(
    private readonly employerCompaniesService: EmployerCompaniesService,
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly employerInvitationsService: EmployerInvitationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @ApiOperation({ summary: 'Get list of colleges.' })
  @Get()
  async GetColleges(@Query() paginationDto: PaginationDto): Promise<SuccessInterface> {
    paginationDto.keyword = paginationDto.keyword ? paginationDto.keyword : '';
    paginationDto.page = Number(paginationDto.page) ? Number(paginationDto.page) : 1;
    paginationDto.perPage = Number(paginationDto.perPage) ? Number(paginationDto.perPage) : 6;
    paginationDto.collegeId = paginationDto.collegeId ? paginationDto.collegeId : null;

    return await this.employerCompaniesService.getEmployersList(paginationDto);
  }
}
