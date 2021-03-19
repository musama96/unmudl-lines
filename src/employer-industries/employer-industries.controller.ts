import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { EmployerIndustriesService } from './employer-industries.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListDto } from '../common/dto/list.dto';
import { CreateEmployerIndustryDto } from './dto/create-employer-industry.dto';
import { EmployerIndustryIdDto } from '../common/dto/employerIndustryId.dto';
import { GetAllIndustriesDto } from './dto/get-all-industries.dto';

@ApiTags('Employer Industries')
@Controller('employer-industries')
export class EmployerIndustriesController {
  constructor(private readonly employerIndustriesService: EmployerIndustriesService) {}

  @ApiOperation({ summary: 'Create new employer industry.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async createIndustry(@Body() createEmployerIndustryDto: CreateEmployerIndustryDto) {
    return await this.employerIndustriesService.createIndustry(createEmployerIndustryDto);
  }

  @ApiOperation({ summary: 'Get sorted and paginated list of industries.' })
  @Get()
  async getIndustries(@Query() listDto: ListDto) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'title';

    return await this.employerIndustriesService.getIndustries(listDto);
  }

  @ApiOperation({ summary: 'Get sorted list of all industries.' })
  @Get('all')
  async getAllIndustries(@Query() listDto: GetAllIndustriesDto) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    return await this.employerIndustriesService.getAllIndustries(listDto);
  }

  @ApiOperation({ summary: 'Disable an industry.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async disableIndustry(@Param() employerIndustryIdDto: EmployerIndustryIdDto) {
    return await this.employerIndustriesService.disableIndustry(employerIndustryIdDto.id);
  }

  @ApiOperation({ summary: 'Enable an industry.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/enable/:id')
  async enableIndustry(@Param() employerIndustryIdDto: EmployerIndustryIdDto) {
    return await this.employerIndustriesService.enableIndustry(employerIndustryIdDto.id);
  }
}
