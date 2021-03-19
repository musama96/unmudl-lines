import { Body, Controller, Get, Post, UploadedFiles, UseGuards, UseInterceptors, Query, HttpCode } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { BlogsService } from '../blogs/blogs.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateLandingPageDto } from './dto/updateLandingPage.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LandingPageService } from './landing-page.service';
import { UpdateLandingPartnersDto } from './dto/updateLandingPartners.dto';
import { UpdateLandingFeaturedCoursesDto } from './dto/updateLandingFeaturedCourses.dto';
import { UpdateLandingHighlyRatedCoursesDto } from './dto/updateLandingHighlyRatedCourses.dto';
import { UpdateLandingBlogsDto } from './dto/updateLandingBlogs.dto';
import { SearchCoursesDto } from './dto/searchCourses.dto';
import { SuccessInterface } from '../common/ResponseHandler';
import { UpdateFooterContentDto } from './dto/updateFooterContent.dto';
import { UpdateLandingCredentialCoursesDto } from './dto/updateLandingCredentialCourses.dto';
import { UpdatePreviewContentDto } from './dto/updatePreviewContent.dto';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
const sharp = require('sharp');
import * as fs from 'fs';

@ApiTags('Landing Page')
@Controller('landing-page')
export class LandingPageController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly blogsService: BlogsService,
    private readonly landingPageService: LandingPageService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get landing page alt tag, main title and tag line.' })
  @Get()
  async GetLandingPageInfo() {
    return await this.landingPageService.getLandingPage();
  }

  @ApiOperation({ summary: 'Get landing page data for learners.' })
  @Get('/data')
  async GetLandingPageData() {
    return await this.landingPageService.getLearnersLandingPage();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get list of courses  matching search.' })
  @Get('courses')
  async GetCoursesDropdown(@Query() searchCoursesDto: SearchCoursesDto): Promise<SuccessInterface> {
    searchCoursesDto.keyword = searchCoursesDto.keyword ? searchCoursesDto.keyword : '';
    searchCoursesDto.collegeId = searchCoursesDto.collegeId ? searchCoursesDto.collegeId : null;
    searchCoursesDto.perPage = Number(searchCoursesDto.perPage) ? Number(searchCoursesDto.perPage) : 10;

    return await this.landingPageService.getCoursesDropdown(searchCoursesDto);
  }

  @ApiOperation({ summary: 'Get list of courses  matching search.' })
  @Get('searchedCourses')
  async GetCoursesList(@Query() searchCoursesDto: SearchCoursesDto): Promise<SuccessInterface> {
    searchCoursesDto.keyword = searchCoursesDto.keyword ? searchCoursesDto.keyword : '';
    searchCoursesDto.collegeId = searchCoursesDto.collegeId ? searchCoursesDto.collegeId : null;
    searchCoursesDto.perPage = Number(searchCoursesDto.perPage) ? Number(searchCoursesDto.perPage) : 20;

    return await this.landingPageService.getSearchedCourses(searchCoursesDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update landing page cover, alt tag, main title and tag line.' })
  @Post('update-basic')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/uploads/');
        },
        filename: (req, file, cb) => {
          cb(null, `main-cover-${Date.now()}.jpg`);
        },
      }),
    }),
  )
  async UpdateLandingPageInfo(@Body() updateLandingDto: UpdateLandingPageDto, @UploadedFiles() files) {
    if (files && files.cover && files.cover[0]) {
      // @ts-ignore
      updateLandingDto.coverPhoto = '/uploads/' + files.cover[0].filename;

      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination('uploads/', files);
        files.cover[0].buffer = fs.readFileSync(files.cover[0].path);
        moveFilesToS3('uploads/', files);
      }
    }
    updateLandingDto.hyperlink = updateLandingDto.hyperlink ? updateLandingDto.hyperlink : null;
    updateLandingDto.pictureCredits = updateLandingDto.pictureCredits ? updateLandingDto.pictureCredits : null;
    return await this.landingPageService.updateLandingPageInfo(updateLandingDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update landing page partners list.' })
  @Post('update-partners')
  @HttpCode(200)
  async UpdateLandingPagePartners(@Body() updateLandingPartnersDto: UpdateLandingPartnersDto) {
    return await this.landingPageService.updateLandingPagePartners(updateLandingPartnersDto.partners);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update landing page featured courses list.' })
  @Post('update-featured-courses')
  @HttpCode(200)
  async UpdateLandingPageFeaturedCourses(@Body() updateLandingFeaturedCoursesDto: UpdateLandingFeaturedCoursesDto) {
    return await this.landingPageService.updateLandingPageFeaturedCourses(updateLandingFeaturedCoursesDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update landing page highly rated list.' })
  @Post('update-highly-rated-courses')
  @HttpCode(200)
  async UpdateLandingPageHighlyRatedCourses(@Body() updateLandingHighlyRatedCoursesDto: UpdateLandingHighlyRatedCoursesDto) {
    return await this.landingPageService.updateLandingPageHighlyRatedCourses(updateLandingHighlyRatedCoursesDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update landing page highly rated list.' })
  @Post('update-credential-courses')
  @HttpCode(200)
  async UpdateLandingPageCredentialCourses(@Body() updateLandingCredentialCoursesDto: UpdateLandingCredentialCoursesDto) {
    return await this.landingPageService.updateLandingPageCredentialCourses(updateLandingCredentialCoursesDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update landing page blogs list.' })
  @Post('update-blogs')
  @HttpCode(200)
  async UpdateLandingPageBlogs(@Body() updateLandingBlogsDto: UpdateLandingBlogsDto) {
    return await this.landingPageService.updateLandingPageBlogs(updateLandingBlogsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update footer pages content.' })
  @Post('update-footer-content')
  @HttpCode(200)
  async updateFooterContent(@Body() updateFooterContentDto: UpdateFooterContentDto) {
    return await this.landingPageService.updateFooterContent(updateFooterContentDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Update preview page content.' })
  @Post('update-preview-content')
  @HttpCode(200)
  async updatePreviewContent(@Body() updatePreviewContentDto: UpdatePreviewContentDto) {
    return await this.landingPageService.updatePreviewContent(updatePreviewContentDto.previewContent);
  }

  @ApiOperation({ summary: 'Get data for about us page.' })
  @Get('about-us')
  async getAboutUs() {
    return await this.landingPageService.getAboutUs();
  }

  @ApiOperation({ summary: 'Get data for why unmudl page.' })
  @Get('why-unmudl')
  async getWhyUnmudl() {
    return await this.landingPageService.getWhyUnmudl();
  }

  @ApiOperation({ summary: 'Get data for privacy policy page.' })
  @Get('privacy-policy')
  async getPrivacyPolicy() {
    return await this.landingPageService.getPrivacyPolicy();
  }

  @ApiOperation({ summary: 'Get data for terms of service page.' })
  @Get('terms-of-service')
  async getTermsOfService() {
    return await this.landingPageService.getTermsOfService();
  }

  @ApiOperation({ summary: 'Get data for accessibility page.' })
  @Get('accessibility')
  async getAccessibility() {
    return await this.landingPageService.getAccessibility();
  }

  @ApiOperation({ summary: 'Get content for preview page.' })
  @Get('preview-content')
  async getPreviewContent() {
    return await this.landingPageService.getPreviewContent();
  }
}
