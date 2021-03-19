import {Body, Controller, Get, HttpCode, Post, Query, UseGuards, Param, Delete} from '@nestjs/common';
import {BlogTagsService} from './blog-tags.service';
import {CreateBlogTagDto} from './dto/createBlogTag.dto';
import {KeywordDto} from '../common/dto/keyword.dto';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {ListDto} from './dto/list.dto';
import { TagIdDto } from './dto/tagIdDto.dto';

@ApiTags('Blog Tags')
@Controller('blog-tags')
export class BlogTagsController {
  constructor(private readonly blogTagsService: BlogTagsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add new blog tag.' })
  @Post()
  @HttpCode(200)
  async CreateBlogTag(@Body() createBlogTagDto: CreateBlogTagDto) {
    return await this.blogTagsService.createBlogTag(createBlogTagDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get blog tags list.' })
  @Get()
  async GetBlogTags(@Query() keywordDto: ListDto) {
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';

    return await this.blogTagsService.getTags(keywordDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get all blog tags.' })
  @Get('/all')
  async GetAllBlogTags(@Query() keywordDto: KeywordDto) {
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';

    return await this.blogTagsService.getAllTags(keywordDto.keyword);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete partner groups.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':tagId')
  async DeleteTag(@Param() tagIdDto: TagIdDto) {
    return await this.blogTagsService.deleteTag(tagIdDto.tagId);
  }
}
