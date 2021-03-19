import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SourceTalentIdDto } from '../common/dto/sourceTalentId.dto';
import { CreateSourceTalentDto } from './dto/createSourceTalent.dto';
import { SourceTalentListDto } from './dto/sourceTalentList.dto';
import { SourceTalentService } from './source-talent.service';

@ApiTags('Source Talent')
@Controller('source-talent')
export class SourceTalentController {
  constructor(private readonly sourceTalentService: SourceTalentService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator', 'instructor', 'recruiter')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async createSourceTalent(@Body() createSourceTalentDto: CreateSourceTalentDto, @GetUser() user) {
    createSourceTalentDto.employer = user.employerId;
    createSourceTalentDto.createdBy = user._id;

    return await this.sourceTalentService.createSourceTalent(createSourceTalentDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSourceTalentsList(@Query() sourceTalentListDto: SourceTalentListDto, @GetUser() user) {
    sourceTalentListDto.employerId = user.employerId
      ? user.employerId
      : sourceTalentListDto.employerId
      ? sourceTalentListDto.employerId
      : null;
    sourceTalentListDto.keyword = sourceTalentListDto.keyword ? sourceTalentListDto.keyword : '';
    sourceTalentListDto.page = Number(sourceTalentListDto.page) ? sourceTalentListDto.page : 1;
    sourceTalentListDto.perPage = Number(sourceTalentListDto.perPage) ? sourceTalentListDto.perPage : 10;
    sourceTalentListDto.sortOrder = sourceTalentListDto.sortOrder === 'asc' ? '1' : '-1';
    sourceTalentListDto.sortBy = sourceTalentListDto.sortBy ? sourceTalentListDto.sortBy : 'createdAt';

    return await this.sourceTalentService.getSourceTalentsList(sourceTalentListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/details/:id')
  async getSourceTalentDetails(@Param() sourceTalentIdDto: SourceTalentIdDto) {
    return await this.sourceTalentService.getSourceTalentDetails(sourceTalentIdDto.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('/resend/:id')
  async resendSourceTalentMessages(@Param() sourceTalentIdDto: SourceTalentIdDto, @GetUser() user) {
    return await this.sourceTalentService.resendSourceTalentMessages(sourceTalentIdDto.id, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteSourceTalent(@Param() sourceTalentIdDto: SourceTalentIdDto) {
    return await this.sourceTalentService.deleteSourceTalent(sourceTalentIdDto.id);
  }
}
