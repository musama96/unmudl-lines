import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import ResponseHandler from '../common/ResponseHandler';
import { EmployerDashboardPaginationDto } from './dto/employerDashboardPagination.dto';
import { GetEmployerDashboardDto } from './dto/getEmployerDashboard.dto';
import { EmployerDashboardService } from './employer-dashboard.service';

@ApiTags('Employer Dashboard')
@Controller('employer-dashboard')
export class EmployerDashboardController {
  constructor(private readonly employerDashboardService: EmployerDashboardService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'recruiter')
  @ApiOperation({ summary: 'Get employer dashboard data.' })
  @Get()
  async getCompleteDashboardData(@Query() getEmployerDashboardDto: GetEmployerDashboardDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    getEmployerDashboardDto.employerAdminId = user._id;
    getEmployerDashboardDto.employerId = user.employerId ? user.employerId : getEmployerDashboardDto.employerId;
    return await this.employerDashboardService.getCompleteDashboardData(getEmployerDashboardDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'recruiter')
  @ApiOperation({ summary: 'Get employer metrics for dashboard.' })
  @Get('metrics')
  async getDashboardMetrics(@Query() getEmployerDashboardDto: GetEmployerDashboardDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    getEmployerDashboardDto.employerId = user.employerId ? user.employerId : getEmployerDashboardDto.employerId;
    return await this.employerDashboardService.getDashboardMetrics(getEmployerDashboardDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'recruiter')
  @ApiOperation({ summary: 'Get employer contact college activity for dashboard.' })
  @Get('contact-college-activity')
  async getContactCollegeActivity(@Query() employerDashboardPaginationDto: EmployerDashboardPaginationDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    employerDashboardPaginationDto.employerAdminId = user._id;
    return await this.employerDashboardService.getContactCollegeActivity(employerDashboardPaginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'recruiter')
  @ApiOperation({ summary: 'Get employer source talent activity for dashboard.' })
  @Get('source-talent-activity')
  async getSourceTalentActivity(@Query() employerDashboardPaginationDto: EmployerDashboardPaginationDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    employerDashboardPaginationDto.employerAdminId = user._id;
    return await this.employerDashboardService.getSourceTalentActivity(employerDashboardPaginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'recruiter')
  @ApiOperation({ summary: 'Get employer forum activity for dashboard.' })
  @Get('employer-forum-activity')
  async getEmployerForumActivity(@Query() employerDashboardPaginationDto: EmployerDashboardPaginationDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    employerDashboardPaginationDto.employerAdminId = user._id;
    return await this.employerDashboardService.getEmployerForumActivity(employerDashboardPaginationDto);
  }
}
