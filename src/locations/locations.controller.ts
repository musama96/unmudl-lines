import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards, HttpCode,
} from '@nestjs/common';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateStateDto } from './dto/createState.dto';
import { CreateCountryDto } from './dto/createCountry.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { LocationsService } from './locations.service';
import {ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
  ) {}

  @Get('state')
  async getStates(@Query() keywordDto: KeywordDto) {
    const states = await this.locationsService.getStates(keywordDto.keyword ? keywordDto.keyword : '');
    return ResponseHandler.success({states});
  }

  @Get('country')
  async getCountries(@Query() keywordDto: KeywordDto) {
    const countries = await this.locationsService.getContries(keywordDto.keyword ? keywordDto.keyword : '');
    return ResponseHandler.success({countries});
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Add a state.' })
  @Post('state')
  @HttpCode(200)
  async createState(@Body() createStateDto: CreateStateDto) {
    const state = await this.locationsService.createState(createStateDto);
    return ResponseHandler.success({state});
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Add a country.' })
  @Post('country')
  @HttpCode(200)
  async createContry(@Body() createCountryDto: CreateCountryDto) {
    const country = await this.locationsService.createCountry(createCountryDto);
    return ResponseHandler.success({country});
  }

}
