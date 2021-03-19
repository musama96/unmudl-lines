import { Controller, Get, Query, HttpService } from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import { ListDto } from '../common/dto/list.dto';

const { SCORECARD_API_KEY } = require('../config/config');

@ApiTags('External APIs')
@Controller('external')
export class ExternalController {
  constructor(private readonly httpService: HttpService) {}

  @ApiOperation({ summary: 'Get a list of college titles from College ScoreCard external API.' })
  @Get('/score-card')
  async fetchTitlesFromCollegeScorecard(@Query() listDto: ListDto) {
    const keyword = listDto.keyword;
    const page = Number(listDto.page) ? Number(listDto.page) : 1;
    const perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 20;

    const response = await this.httpService.get('https://api.data.gov/ed/collegescorecard/v1/schools', {
      params: {
        'school.name': keyword,
        'page': page,
        'per_page': perPage,
        'api_key': SCORECARD_API_KEY,
        '_fields': 'id,school.name',
      },
    }).toPromise();

    return response.data;
  }
}
