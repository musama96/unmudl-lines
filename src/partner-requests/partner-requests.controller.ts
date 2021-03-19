import { Body, Controller, Get, HttpCode, Post, Query, UseGuards, Param, Delete, Header } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PartnerRequestsService } from './partner-requests.service';
import { PartnerRequestListDto } from './dto/partnerRequestList.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PartnerRequestIdDto } from '../common/dto/partnerRequestId.dto';
import { UpdatePartnerRequestStatusDto } from './dto/updatePartnerRequestStatus.dto';

@ApiTags('Partner Requests (Admin Panel)')
@Controller('partner-requests')
export class PartnerRequestsController {
  constructor(private readonly partnerRequestsService: PartnerRequestsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of partner requests.' })
  @Get()
  async GetPartnerRequests(@Query() partnerRequestListDto: PartnerRequestListDto) {
    partnerRequestListDto.keyword = partnerRequestListDto.keyword ? partnerRequestListDto.keyword : '';
    partnerRequestListDto.sortOrder = partnerRequestListDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.partnerRequestsService.getPartnerRequests(partnerRequestListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a list of partner requests as csv.' })
  @Get('csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=Partner Requests.csv')
  async GetPartnerRequestsCsv(@Query() partnerRequestListDto: PartnerRequestListDto) {
    partnerRequestListDto.keyword = partnerRequestListDto.keyword ? partnerRequestListDto.keyword : '';
    partnerRequestListDto.sortOrder = partnerRequestListDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.partnerRequestsService.getPartnerRequestsCsv(partnerRequestListDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner request details.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Get('/details/:partnerRequestId')
  async GetPartnerRequestDetails(@Param() partnerRequestIdDto: PartnerRequestIdDto) {
    return await this.partnerRequestsService.getPartnerRequestDetails(partnerRequestIdDto.partnerRequestId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update partner request status.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('update-status')
  @HttpCode(200)
  async UpdatePartnerRequestStatus(@Body() updatePartnerRequestStatusDto: UpdatePartnerRequestStatusDto) {
    return await this.partnerRequestsService.updatePartnerRequestStatus(updatePartnerRequestStatusDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete partner request.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Delete(':partnerRequestId')
  async DeletePartnerRequest(@Param() partnerRequestIdDto: PartnerRequestIdDto) {
    return await this.partnerRequestsService.deletePartnerRequest(partnerRequestIdDto.partnerRequestId);
  }
}
