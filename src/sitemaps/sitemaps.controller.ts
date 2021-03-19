import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SitemapsService } from './sitemaps.service';

@ApiTags('Sitemap Generation')
@Controller('sitemaps')
export class SitemapsController {
  constructor(
    private readonly sitemapsService: SitemapsService,
  ) {}

  @Get('/colleges')
  async GetCollegesForSitemap() {
    return await this.sitemapsService.getCollegesForSiteMap();
  }

  @Get('/courses')
  async GetCoursesForSitemap() {
    return await this.sitemapsService.getCoursesForSiteMap();
  }
}
