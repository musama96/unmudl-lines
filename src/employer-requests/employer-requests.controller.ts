import { Controller, UseGuards, Get, Query, Header, Param, Post, HttpCode, Body, Delete } from '@nestjs/common';
import { EmployerRequestsService } from './employer-requests.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EmployerRequestListDto } from './dto/employerRequestList.dto';
import { EmployerRequestIdDto } from '../common/dto/employerRequestId.dto';
import { UpdateEmployerRequestStatusDto } from './dto/updateEmployerRequestStatus.dto';

@ApiTags('Employer Partner Requests (Admin Portal)')
@Controller('employer-requests')
export class EmployerRequestsController {
  constructor(private readonly employerRequestsService: EmployerRequestsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of partner requests.' })
  @Get()
  async GetEmployerRequests(@Query() employerRequestListDto: EmployerRequestListDto) {
    employerRequestListDto.keyword = employerRequestListDto.keyword ? employerRequestListDto.keyword : '';
    employerRequestListDto.sortOrder = employerRequestListDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.employerRequestsService.getEmployerRequests(employerRequestListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a list of partner requests as csv.' })
  @Get('csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=Partner Requests.csv')
  async GetEmployerRequestsCsv(@Query() employerRequestListDto: EmployerRequestListDto) {
    employerRequestListDto.keyword = employerRequestListDto.keyword ? employerRequestListDto.keyword : '';
    employerRequestListDto.sortOrder = employerRequestListDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.employerRequestsService.getEmployerRequestsCsv(employerRequestListDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner request details.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/:employerRequestId')
  async GetEmployerRequestDetails(@Param() employerRequestIdDto: EmployerRequestIdDto) {
    return await this.employerRequestsService.getEmployerRequestDetails(employerRequestIdDto.employerRequestId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update partner request status.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('update-status')
  @HttpCode(200)
  async UpdatePartnerRequestStatus(@Body() updateEmployerRequestStatusDto: UpdateEmployerRequestStatusDto) {
    return await this.employerRequestsService.updateEmployerRequestStatus(updateEmployerRequestStatusDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete partner request.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Delete(':employerRequestId')
  async DeletePartnerRequest(@Param() employerRequestIdDto: EmployerRequestIdDto) {
    return await this.employerRequestsService.deleteEmployerRequest(employerRequestIdDto.employerRequestId);
  }
}
