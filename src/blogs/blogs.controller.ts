import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/createBlog.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BLOGS_IMG_PATH, BLOG_THUMBNAIL_SIZE } from '../config/config';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BlogIdDto } from '../common/dto/blogId.dto';
import { UpdateBlogPublishedDto } from './dto/updateBlogPublished.dto';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { GetUser } from '../auth/get-user.decorator';
import { BlogsListDto } from './dto/blogsList.dto';
import { BlogStatus } from '../common/enums/createBlog.enum';
import ResponseHandler from '../common/ResponseHandler';
import { SetBlogsFeaturedDto, FeaturedStatus } from './dto/setBlogsFeatured.dto';
const sharp = require('sharp');
import * as fs from 'fs';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Create blog as pending or draft.' })
  @Post()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'headerImage', maxCount: 1 },
        // { name: 'headerImageThumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            fs.mkdir('./public/uploads/blogs-images/', { recursive: true }, err => {
              if (err) {
                return ResponseHandler.fail(err.message);
              }
              cb(null, './public/uploads/blogs-images/');
            });
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
        }),
      },
    ),
  )
  async Create(@Body() createBlogDto: CreateBlogDto, @UploadedFiles() files, @GetUser() user) {
    if (files && files.headerImage && files.headerImage[0]) {
      createBlogDto.headerImage = BLOGS_IMG_PATH + files.headerImage[0].filename;

      await sharp(files.headerImage[0].path)
        .resize(BLOG_THUMBNAIL_SIZE)
        .toFile(files.headerImage[0].path.replace('.', '_t.'));

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(BLOGS_IMG_PATH, files);
        files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path); // await sharp(files.headerImage[0].path);
        files.headerImageThumbnail = [
          {
            ...files.headerImage[0],
            buffer: await sharp(files.headerImage[0].path)
              .resize(BLOG_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.headerImage[0].filename.replace('.', '_t.'),
          },
        ];
        // console.log(files);
        moveFilesToS3(BLOGS_IMG_PATH, files);
      }
      createBlogDto.headerImageThumbnail = (BLOGS_IMG_PATH + files.headerImage[0].filename).replace('.', '_t.');
    }
    if (user.type === 'employer') {
      createBlogDto.employerAuthor = user._id;
      createBlogDto.employerId = user.employerId;
      delete createBlogDto.collegeId;
      createBlogDto.type = 'employer';
    } else {
      createBlogDto.author = user._id;
      createBlogDto.collegeId = user.collegeId;
      delete createBlogDto.employerId;
      createBlogDto.type = 'college';
    }
    if ((user.collegeId || user.employerId) && createBlogDto.status !== BlogStatus.PENDING && createBlogDto.status !== BlogStatus.DRAFT) {
      createBlogDto.status = BlogStatus.PENDING;
    }
    if (user.collegeId || user.employerId) {
      createBlogDto.featured = null;
    }
    return await this.blogsService.createBlog(createBlogDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Update blog details.' })
  @Post('/update')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'headerImage', maxCount: 1 },
        // { name: 'headerImageThumbnail', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            fs.mkdir('./public/uploads/blogs-images/', { recursive: true }, err => {
              if (err) {
                return ResponseHandler.fail(err.message);
              }
              cb(null, './public/uploads/blogs-images/');
            });
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
        }),
      },
    ),
  )
  async UpdateBlog(@Body() updateBlogDto: UpdateBlogDto, @UploadedFiles() files, @GetUser() user) {
    if (files && files.headerImage && files.headerImage[0]) {
      updateBlogDto.headerImage = BLOGS_IMG_PATH + files.headerImage[0].filename;

      await sharp(files.headerImage[0].path)
        .resize(BLOG_THUMBNAIL_SIZE)
        .toFile(files.headerImage[0].path.replace('.', '_t.'));

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(BLOGS_IMG_PATH, files);
        files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        files.headerImageThumbnail = [
          {
            ...files.headerImage[0],
            buffer: await sharp(files.headerImage[0].path)
              .resize(BLOG_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.headerImage[0].filename.replace('.', '_t.'),
          },
        ];
        moveFilesToS3(BLOGS_IMG_PATH, files);
      }
      updateBlogDto.headerImageThumbnail = (BLOGS_IMG_PATH + files.headerImage[0].filename).replace('.', '_t.');
    } else {
      //todo: delete image files as well
      delete updateBlogDto.headerImage;
      delete updateBlogDto.headerImageThumbnail;
    }
    // updateBlogDto.author = user._id;
    if (!updateBlogDto.featured) {
      updateBlogDto.featured = null;
    }
    if (user.type === 'employer') {
      updateBlogDto.employerId = user.employerId;
      delete updateBlogDto.collegeId;
    } else {
      updateBlogDto.collegeId = user.collegeId;
      delete updateBlogDto.employerId;
    }
    return await this.blogsService.updateBlog(updateBlogDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get blogs list.' })
  @Get()
  async GetBlogs(@Query() blogsListDto: BlogsListDto, @GetUser() user) {
    blogsListDto.page = blogsListDto.page ? Number(blogsListDto.page) : 1;
    blogsListDto.perPage = blogsListDto.perPage ? Number(blogsListDto.perPage) : 1;
    blogsListDto.keyword = blogsListDto.keyword ? blogsListDto.keyword : '';
    blogsListDto.sortOrder = blogsListDto.sortOrder === 'asc' ? '1' : '-1';

    if (user.type === 'employer') {
      blogsListDto.employerId = user.employerId;
    } else {
      blogsListDto.collegeId = user.collegeId;
    }

    return await this.blogsService.getBlogs(blogsListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get blogs list.' })
  @Get('admin-home')
  async GetCompleteBlogsSectionData(@Query() blogsListDto: BlogsListDto, @GetUser() user) {
    blogsListDto.page = blogsListDto.page ? Number(blogsListDto.page) : 1;
    blogsListDto.perPage = blogsListDto.perPage ? Number(blogsListDto.perPage) : 1;
    blogsListDto.keyword = blogsListDto.keyword ? blogsListDto.keyword : '';
    blogsListDto.sortOrder = blogsListDto.sortOrder === 'asc' ? '1' : '-1';

    if (user.type === 'employer') {
      blogsListDto.employerId = user.employerId;
    } else {
      blogsListDto.collegeId = user.collegeId;
    }

    const submittedBlogsResponse = await this.blogsService.getBlogs(blogsListDto);

    return ResponseHandler.success({
      submittedBlogs: submittedBlogsResponse.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get blog details.' })
  @Get('/details/:blogId')
  async GetBlogDetails(@Param() blogIdDto: BlogIdDto) {
    return await this.blogsService.getBlogById(blogIdDto.blogId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Update blog published status.' })
  @Post('/update/status')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateBlogPublishedStatus(@Body() updateBlogPublishedDto: UpdateBlogPublishedDto, @GetUser() user) {
    return await this.blogsService.updateBlogPublishedStatus(updateBlogPublishedDto, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Update blog published status.' })
  @Post('/update/featured')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateBlogsFeatured(@Body() setBlogsFeaturedDto: SetBlogsFeaturedDto) {
    setBlogsFeaturedDto.update = { featured: setBlogsFeaturedDto.status !== FeaturedStatus.UNFEATURE ? 1 : null };
    return await this.blogsService.updateFeatured(setBlogsFeaturedDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Delete blog.' })
  @Delete(':blogId')
  async DeleteBlogById(@Param() blogIdDto: BlogIdDto) {
    return await this.blogsService.deleteBlogById(blogIdDto.blogId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Restore old blog.' })
  @Post('/restore/:blogId')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async RestoreBlogByOldId(@Param() blogIdDto: BlogIdDto, @GetUser() user) {
    return await this.blogsService.restoreBlogByOldId(blogIdDto.blogId, {
      employerId: user.employerId,
      collegeId: user.collegeId,
      userId: user._id,
    });
  }
}
