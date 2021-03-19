import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogTagsService } from '../blog-tags/blog-tags.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogNumIdDto } from '../common/dto/blogNumId.dto';
import { LearnerBlogsListDto } from './dto/learnerBlogsList.dto';
import { SideBarBlogsDto } from './dto/sideBarBlogs.dto';
import { BlogMainPageDto } from './dto/blogMainPage.dto';
import ResponseHandler from '../common/ResponseHandler';

@ApiTags('Blogs(Learners)')
@Controller('learners/blogs')
export class LearnersBlogsController {
  constructor(private readonly blogsService: BlogsService, private readonly blogTagsService: BlogTagsService) {}

  @ApiOperation({ summary: 'Get blogs list.' })
  @Get()
  async GetBlogs(@Query() blogsListDto: LearnerBlogsListDto) {
    blogsListDto.page = blogsListDto.page ? Number(blogsListDto.page) : 1;
    blogsListDto.perPage = blogsListDto.perPage ? Number(blogsListDto.perPage) : 10;
    blogsListDto.keyword = blogsListDto.keyword ? blogsListDto.keyword : '';
    blogsListDto.tag = blogsListDto.tag ? await this.blogTagsService.getTagBySlug(blogsListDto.tag) : '';

    const blogs = await this.blogsService.getPublishedBlogs(blogsListDto);
    return ResponseHandler.success(blogs);
  }

  @ApiOperation({ summary: 'Get blogs main page data.' })
  @Get('mainpage')
  async GetBlogsPageData(@Query() blogsMainPageDto: BlogMainPageDto) {
    blogsMainPageDto.sideBarBlogsPerpage = blogsMainPageDto.sideBarBlogsPerpage ? Number(blogsMainPageDto.sideBarBlogsPerpage) : 3;

    const [featuredBlog, blogTags, popularBlogs, latestBlogs] = await Promise.all([
      this.blogsService.getFeaturedBlog(),
      this.blogTagsService.getTagList(),
      this.blogsService.getSidebarBlogs({ perPage: blogsMainPageDto.sideBarBlogsPerpage, popular: true }),
      this.blogsService.getSidebarBlogs({ perPage: blogsMainPageDto.sideBarBlogsPerpage, popular: false }),
    ]);
    return ResponseHandler.success({ featuredBlog, blogTags, popularBlogs, latestBlogs });
  }

  @ApiOperation({ summary: 'Get sidebar blogs.' })
  @Get('sideBar')
  async GetSideBarBlogs(@Query() sideBarBlogsDto: SideBarBlogsDto) {
    sideBarBlogsDto.perPage = sideBarBlogsDto.perPage ? Number(sideBarBlogsDto.perPage) : 3;

    const blogs = await this.blogsService.getSidebarBlogs(sideBarBlogsDto);
    return ResponseHandler.success(blogs);
  }

  @Get('/details/:blogId')
  async GetBlogDetails(@Param() blogNumIdDto: BlogNumIdDto) {
    return await this.blogsService.getBlogDetails(blogNumIdDto.blogId);
  }
}
