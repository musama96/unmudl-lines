import { Controller, Get, Body, UseGuards, Query, Post, Delete, Param, HttpCode, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler from '../common/ResponseHandler';
import { EmployerPostsService } from './employer-forums.service';
import { CreatePostDto } from './dto/createPost.dto';
import { EditPostDto } from './dto/editPost.dto';
import { PostListDto } from './dto/postsList.dto';
import { AddTagDto } from './dto/addTag.dto';
import { AddCommentDto } from './dto/addComment.dto';
import { EditCommentDto } from './dto/editComment.dto';
import { PostIdDto } from './dto/postId.dto';
import { CommentIdDto } from './dto/commentId.dto';
import { RepliesListDto } from './dto/repliesList.dto';
import { RecentRepliesDto } from './dto/recentReplies.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { ReportPostDto } from './dto/reportPost.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateReportStatusDto } from './dto/updateReportStatus.dto';
import { StatsDto } from './dto/stats.dto';
import { AddReplyDto } from './dto/addReply.dto';
import { ReplyIdDto } from './dto/replyId.dto';
import { EditReplyDto } from './dto/editReply.dto';
import responseMessages from '../config/responseMessages';
import { KeywordDto } from '../common/dto/keyword.dto';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';

@ApiTags('Employer Forum')
@Controller('employer-forums')
export class EmployerPostsController {
  constructor(private readonly employerPostsService: EmployerPostsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comunity forum landing page data.' })
  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetLandingPageData(@Query() dashboardDto: DashboardDto, @GetUser() user) {

    dashboardDto.repliesPerPage = dashboardDto.repliesPerPage ? dashboardDto.repliesPerPage : 7;

    const [counts, recentComments, { postList, totalPosts }] = await Promise.all([
      this.employerPostsService.getTotalPostsAndReplies(dashboardDto),
      this.employerPostsService.getRecentComments({ perPage: dashboardDto.repliesPerPage }),
      this.employerPostsService.getPosts({keyword: '', page: 1, perPage: dashboardDto.postsPerPage, popular: false}),
    ]);
    return ResponseHandler.success({
      totalDiscussions: counts.totalDiscussions,
      totalComments: counts.totalReplies,
      recentComments,
      postList,
      totalPosts,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total participants and total posts count.' })
  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetPostsCount(@Query() statsDto: StatsDto, @GetUser() user) {

    const counts = await this.employerPostsService.getTotalPostsAndReplies(statsDto);
    return ResponseHandler.success({
      totalDiscussions: counts.totalDiscussions,
      totalComments: counts.totalReplies,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comunity forum post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('posts')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async AddPost(@Body() createPostDto: CreatePostDto, @GetUser() user) {

    if (user.type !== 'employer') {
      createPostDto.user = user._id;
    } else {
      createPostDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.createPost(createPostDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a comunity forum post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Put('posts/:postId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async EditPost(@Param() postIdDto: PostIdDto, @Body() editPostDto: EditPostDto, @GetUser() user) {

    editPostDto.postId = postIdDto.postId;
    return await this.employerPostsService.editPost(editPostDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of posts.' })
  @Get('posts')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetPosts(@Query() postListDto: PostListDto, @GetUser() user) {

    postListDto.page = postListDto.page ? postListDto.page : 1;
    postListDto.perPage = postListDto.perPage ? postListDto.perPage : 6;
    postListDto.keyword = postListDto.keyword ? postListDto.keyword : '';
    postListDto.user = user;

    const { postList, totalPosts } = await this.employerPostsService.getPosts(postListDto);
    return ResponseHandler.success({ postList, totalPosts });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single post details with replies.' })
  @Get('posts/:postId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetPost(@Param() postIdDto: PostIdDto, @Query() repliesListDto: RepliesListDto, @GetUser() user) {

    repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
    repliesListDto.repliesPerPage = repliesListDto.repliesPerPage ? repliesListDto.repliesPerPage : 4;

    repliesListDto.postId = postIdDto.postId;
    const [counts, recentComments, post] = await Promise.all([
      this.employerPostsService.getTotalPostsAndReplies(repliesListDto),
      this.employerPostsService.getRecentComments({ perPage: repliesListDto.repliesPerPage }),
      this.employerPostsService.getPost(postIdDto.postId),
    ]);
    repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : post.totalComments > 0 ? post.totalComments : 4;
    const comments = await this.employerPostsService.getComments(repliesListDto);

    return ResponseHandler.success({
      totalDiscussions: counts.totalDiscussions,
      totalComments: counts.totalReplies,
      recentComments,
      post,
      comments,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Delete('/posts/:postId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async DeletePost(@Param() postIdDto: PostIdDto, @GetUser() user) {

    if (user.type !== 'employer'){
      // @ts-ignore
      postIdDto.user = user._id;
    } else {
      // @ts-ignore
      postIdDto.employerAdmin = user._id;
    }
    if (user.type !== 'employer' && !user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
      // @ts-ignore
      postIdDto.isAdmin = true;
    }
    return await this.employerPostsService.deletePost(postIdDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a reply to a post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('comments')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async AddComment(@Body() addCommentDto: AddCommentDto, @GetUser() user) {

    if (user.type !== 'employer') {
      addCommentDto.user = user._id;
    } else {
      addCommentDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.addComment(addCommentDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit reply.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Put('comments/:commentId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async EditComment(@Param() commentIdDto: CommentIdDto, @Body() editCommentDto: EditCommentDto, @GetUser() user) {

    editCommentDto.commentId = commentIdDto.commentId;
    if (user.type !== 'employer') {
      editCommentDto.user = user._id;
    } else {
      editCommentDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.editComment(editCommentDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of post comments.' })
  @Get('comments/:postId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetReplies(@Param() postIdDto: PostIdDto, @Query() repliesListDto: RepliesListDto, @GetUser() user) {

    repliesListDto.page = repliesListDto.page ? repliesListDto.page : 1;
    repliesListDto.perPage = repliesListDto.perPage ? repliesListDto.perPage : 4;

    repliesListDto.postId = postIdDto.postId;
    const { commentsList, totalComments } = await this.employerPostsService.getComments(repliesListDto);
    return ResponseHandler.success({ commentsList, totalComments });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated list of posts replies.' })
  @Get('recentComments')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetRecentReplies(@Query() recentRepliesDto: RecentRepliesDto, @GetUser() user) {

    recentRepliesDto.perPage = recentRepliesDto.perPage ? recentRepliesDto.perPage : 4;

    const recentComments = await this.employerPostsService.getRecentComments(recentRepliesDto);
    return ResponseHandler.success(recentComments);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reply.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Delete('comments/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async DeleteComment(@Param() commentIdDto: CommentIdDto, @GetUser() user) {

    if (user.type !== 'employer') {
      // @ts-ignore
      commentIdDto.user = user._id;
      if (!user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
        // @ts-ignore
        commentIdDto.isAdmin = true;
      }
    } else {
      // @ts-ignore
      commentIdDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.deleteComment(commentIdDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tags for posts.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get('tags')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async GetTags(@Query() keywordDto: KeywordDto) {
    const keyword = keywordDto.keyword ? keywordDto.keyword : '';
    const tags = await this.employerPostsService.getTags(keyword);
    return ResponseHandler.success(tags);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a tag for posts.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('tags')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator')
  async AddTag(@Body() addTagDto: AddTagDto, @GetUser() user) {

    return await this.employerPostsService.addTag(addTagDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a reply to a post.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('replies')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async AddReply(@Body() addReplyDto: AddReplyDto, @GetUser() user) {

    if (user.type !== 'employer') {
      addReplyDto.user = user._id;
    } else {
      addReplyDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.addReply(addReplyDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit reply.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Put('replies/:replyId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async EditReply(@Param() replyIdDto: ReplyIdDto, @Body() editReplyDto: EditReplyDto, @GetUser() user) {

    editReplyDto.replyId = replyIdDto.replyId;
    if (user.type !== 'employer') {
      editReplyDto.user = user._id;
    } else {
      editReplyDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.editReply(editReplyDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a reply.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Delete('replies/:replyId')
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator', 'recruiter')
  @RestrictCollegeUser()
  async DeleteReply(@Param() replyIdDto: ReplyIdDto, @GetUser() user) {

    if (user.type !== 'employer') {
      // @ts-ignore
      replyIdDto.user = user._id;
      if (!user.collegeId && (user.role === 'admin' || user.role === 'superadmin')) {
        // @ts-ignore
        replyIdDto.isAdmin = true;
      }
    } else {
      // @ts-ignore
      replyIdDto.employerAdmin = user._id;
    }
    return await this.employerPostsService.deleteReply(replyIdDto);
  }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a tag for posts.' })
  // @Get('report')
  // @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  // @Roles('admin')
  // async GetReport(@Query() paginationDto: PaginationDto, @GetUser() user) {
  //   if (user.collegeId) {
  //     return ResponseHandler.fail('Only unmudl admin can access this endpoint.');
  //   }
  //   paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
  //   paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 8;
  //   return await this.employerPostsService.getReports(paginationDto);
  // }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a tag for posts.' })
  // @ApiConsumes('application/x-www-form-urlencoded')
  // @Post('report')
  // @HttpCode(200)
  // @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  // @Roles('admin', 'manager', 'moderator', 'recruiter')
  // @RestrictCollegeUser()
  // async AddReport(@Body() reportPostDto: ReportPostDto, @GetUser() user) {
  //   if (!reportPostDto.postId && !reportPostDto.replyId) {
  //     return ResponseHandler.fail('Provide post or reply id.');
  //   }
  //   if (user.type !== 'learner') {
  //     reportPostDto.userId = user._id;
  //   } else {
  //     reportPostDto.learnerId = user._id;
  //   }
  //   return await this.employerPostsService.addReport(reportPostDto);
  // }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a tag for posts.' })
  // @ApiConsumes('application/x-www-form-urlencoded')
  // @Post('report/updateStatus')
  // @HttpCode(200)
  // @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  // @Roles('admin')
  // async UpdateReportStatus(@Body() updateReportStatusDto: UpdateReportStatusDto, @GetUser() user) {
  //   if (user.collegeId) {
  //     return ResponseHandler.fail('Only unmudl admin can access this endpoint.');
  //   }
  //   return await this.employerPostsService.updateReportStatus(updateReportStatusDto);
  // }
}
