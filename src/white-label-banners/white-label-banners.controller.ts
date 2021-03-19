import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WhiteLabelBannersService } from './white-label-banners.service';

@ApiTags('White Label Banner')
@Controller('white-label-banners')
export class WhiteLabelBannersController {
  constructor(private readonly whiteLabelBannersService: WhiteLabelBannersService) {}

  @ApiOperation({ summary: 'Get white label banner details.' })
  @Get(':identifier')
  async getSourceTalentsList(@Param() identifierDto: {identifier?: string}) {
    return await this.whiteLabelBannersService.getWhiteLabelBanner(identifierDto.identifier);
  }
}
