import { Controller, Get, Body, UseGuards, Query, Post, Delete, Param, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler from '../common/ResponseHandler';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { EditPostDto } from './dto/editPost.dto';
import { PostListDto } from './dto/postsList.dto';
import { AddTagDto } from './dto/addTag.dto';
import { AddReplyDto } from './dto/addReply.dto';
import { EditReplyDto } from './dto/editReply.dto';
import { PostIdDto } from './dto/postId.dto';
import { ReplyIdDto } from './dto/replyId.dto';
import { RepliesListDto } from './dto/repliesList.dto';
import { RecentRepliesDto } from './dto/recentReplies.dto';
import { LandingPageDto } from './dto/landingPage.dto';
import { ReportPostDto } from './dto/reportPost.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateReportStatusDto } from './dto/updateReportStatus.dto';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';

@ApiTags('Posts (Comunity Forum)')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Get comunity forum landing page data.' })
  @Get('landingPage')
  async GetLandingPageData(@Query() landingPageDto: LandingPageDto) {
    landingPageDto.repliesPerPage = landingPageDto.repliesPerPage ? landingPageDto.repliesPerPage : 7;

    const [counts, recentReplies] = await Promise.all([
      this.postsService.getTotalPostAndParticipants(),
      this.postsService.getRecentReplies({ perPage: landingPageDto.repliesPerPage }),
    ]);
    return ResponseHandler.success({
      totalParticipants: counts.totalParticipants,
      totalPosts: counts.totalPosts,
      recentReplies,
    });
  }

  @ApiOperation({ summary: 'Get total participants and total posts count.' })
  @Get('count')
  async GetPostsCount() {
    const data = await this.postsService.getTotalPostAndParticipants();
    return ResponseHandler.success(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comunity forum post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddPost(@Body() createPostDto: CreatePostDto, @GetUser() learner) {
    createPostDto.author = learner._id;
    // @ts-ignore
    return await this.postsService.createPost(createPostDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a comunity forum post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('edit')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async EditPost(@Body() editPostDto: EditPostDto, @GetUser() learner) {
    return await this.postsService.editPost(editPostDto, learner._id);
  }

  @ApiOperation({ summary: 'Get paginated list of posts.' })
  @Get()
  async GetPosts(@Query() postListDto: PostListDto) {
    postListDto.page = postListDto.page ? postListDto.page : 1;
    postListDto.perPage = postListDto.perPage ? postListDto.perPage : 6;
    postListDto.keyword = postListDto.keyword ? postListDto.keyword : '';

    const { postList, totalPosts } = await this.postsService.getPosts(postListDto);
    return ResponseHandler.success({ postList, totalPosts });
  }

  @ApiOperation({ summary: 'Get single post details with replies.' })
  @Get('details')
  async GetPost(@Query() repliesListDto: RepliesListDto) {
    repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
    repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : 4;
    repliesListDto.recentRepliesPerPage = repliesListDto.recentRepliesPerPage ? repliesListDto.recentRepliesPerPage : 4;

    const [post, recentReplies] = await Promise.all([
      this.postsService.getPostByNumId(repliesListDto.numId),
      this.postsService.getRecentReplies({ perPage: repliesListDto.recentRepliesPerPage }),
    ]);
    repliesListDto.postId = post._id;
    const replies = await this.postsService.getReplies(repliesListDto);

    return ResponseHandler.success({ post, replies, recentReplies });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Delete(':postId')
  @UseGuards(AuthGuard('jwt'))
  async DeletePost(@Param() postIdDto: PostIdDto, @GetUser() learner) {
    // @ts-ignore
    postIdDto.learner = learner._id;
    if (learner.type !== 'learner' && !learner.collegeId && (learner.role === 'admin' || learner.role === 'superadmin')) {
      // @ts-ignore
      postIdDto.isAdmin = true;
    }
    return await this.postsService.deletePost(postIdDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a reply to a post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('reply')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddReply(@Body() addReplyDto: AddReplyDto, @GetUser() user) {
    if (user.type !== 'learner') {
      // @ts-ignore
      addReplyDto.user = user._id;
    } else {
      // @ts-ignore
      addReplyDto.learner = user._id;
    }
    return await this.postsService.addReply(addReplyDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit reply.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('reply/edit')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async EditReply(@Body() editReplyDto: EditReplyDto, @GetUser() user) {
    if (user.type !== 'learner') {
      // @ts-ignore
      editReplyDto.user = user._id;
    } else {
      // @ts-ignore
      editReplyDto.learner = user._id;
    }
    return await this.postsService.editReply(editReplyDto);
  }

  @ApiOperation({ summary: 'Get paginated list of posts replies.' })
  @Get('replies')
  async GetReplies(@Query() repliesListDto: RepliesListDto) {
    repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
    repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : 4;

    const { repliesList, totalReplies } = await this.postsService.getReplies(repliesListDto);
    return ResponseHandler.success({ repliesList, totalReplies });
  }

  @ApiOperation({ summary: 'Get paginated list of posts replies.' })
  @Get('recentReplies')
  async GetRecentReplies(@Query() recentRepliesDto: RecentRepliesDto) {
    recentRepliesDto.perPage = recentRepliesDto.perPage ? recentRepliesDto.perPage : 4;

    const recentReplies = await this.postsService.getRecentReplies(recentRepliesDto);
    return ResponseHandler.success(recentReplies);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reply.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Delete('reply/:replyId')
  @UseGuards(AuthGuard('jwt'))
  async DeleteReply(@Param() replyIdDto: ReplyIdDto, @GetUser() user) {
    if (user.type !== 'learner') {
      // @ts-ignore
      replyIdDto.user = user._id;
      if (!user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
        // @ts-ignore
        replyIdDto.isAdmin = true;
      }
    } else {
      // @ts-ignore
      replyIdDto.learner = user._id;
    }
    return await this.postsService.deleteReply(replyIdDto);
  }

  @ApiOperation({ summary: 'Get tags for posts.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get('tags')
  async GetTags() {
    const tags = await this.postsService.getTags();
    return ResponseHandler.success(tags);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tag for posts.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('tags')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddTag(@Body() addTagDto: AddTagDto) {
    return await this.postsService.addTag(addTagDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tag for posts.' })
  @Get('report')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  async GetReport(@Query() paginationDto: PaginationDto, @GetUser() user) {

    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 8;
    return await this.postsService.getReports(paginationDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tag for posts.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('report')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddReport(@Body() reportPostDto: ReportPostDto, @GetUser() user) {
    if (!reportPostDto.postId && !reportPostDto.replyId) {
      return ResponseHandler.fail('Provide post or reply id.');
    }
    if (user.type !== 'learner') {
      reportPostDto.userId = user._id;
    } else {
      reportPostDto.learnerId = user._id;
    }
    return await this.postsService.addReport(reportPostDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tag for posts.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('report/updateStatus')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  async UpdateReportStatus(@Body() updateReportStatusDto: UpdateReportStatusDto, @GetUser() user) {

    return await this.postsService.updateReportStatus(updateReportStatusDto);
  }
}
