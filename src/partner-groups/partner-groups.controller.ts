import { Body, Controller, Get, HttpCode, Post, UseGuards, Delete, Param } from '@nestjs/common';
import { PartnerGroupsService } from './partner-groups.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SuccessInterface } from '../common/ResponseHandler';
import { AddPartnerGroupDto } from './dto/addPartnerGroup.dto';
import { UpdatePartnerGroupDto } from './dto/updatePartnerGroup.dto';
import { GroupIdDto } from './dto/groupIdDto.dto';
import { GetUser } from '../auth/get-user.decorator';

@Controller('partner-groups')
@ApiTags('Partner Groups')
export class PartnerGroupsController {
  constructor(private readonly partnerGroupsService: PartnerGroupsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a partner group.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async AddPartnerGroup(@Body() addPartnerGroupDto: AddPartnerGroupDto): Promise<SuccessInterface> {
    return await this.partnerGroupsService.addPartnerGroup(addPartnerGroupDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a partner group.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Post('/update')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdatePartnerGroup(@Body() updatePartnerGroupDto: UpdatePartnerGroupDto): Promise<SuccessInterface> {
    return await this.partnerGroupsService.updatePartnerGroup(updatePartnerGroupDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all partner groups.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get()
  async GetAllPartnerGroup(): Promise<SuccessInterface> {
    return await this.partnerGroupsService.getAllPartnerGroup();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete partner groups.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':groupId')
  async DeletePartnerGroup(@Param() groupIdDto: GroupIdDto, @GetUser() user) {
    return await this.partnerGroupsService.deleteGroup(groupIdDto.groupId);
  }
}
