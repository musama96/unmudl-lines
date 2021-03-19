import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  Query,
  UploadedFiles,
  Param,
  Header,
  HttpCode,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UserTokensService } from './userTokens.service';
import { CreateUserDto } from './dto/createUser.dto';
import { TokenDto } from './dto/token.dto';
import { UserIdDto } from '../common/dto/userId.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { InstructorCoursesListDto } from './dto/instructorCoursesList.dto';
import { EmailDto } from '../common/dto/email.dto';
import { UpdateUserRoleDto } from '../common/dto/updateUserRole.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListDto } from '../common/dto/list.dto';
import { GetUser } from '../auth/get-user.decorator';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateBasicDetailsDto } from './dto/updateBasicDetails.dto';
import { UpdatePreferencesDto } from './dto/updatePreferences.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { StripeService } from '../stripe/stripe.service';
import { InvitationsService } from '../invitations/invitations.service';
import { ActivitiesService } from '../activities/activities.service';
import { isAuthorized } from '../common/validators/access.validator';
import { USERS_IMG_PATH, PROFILE_PHOTO_THUMBNAIL_SIZE } from '../config/config';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { OptionalDurationDto } from '../common/dto/optionalDuration.dto';
import { StripeTokenDto } from '../common/dto/stripeToken.dto';
import { CollegesService } from '../colleges/colleges.service';
import { PayoutsService } from '../payouts/payouts.service';
import { TransactionsService } from '../transactions/transactions.service';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import commonFunctions from '../common/functions';
import { InstructorSectionDataDto } from './dto/instructorSectionData.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { InvitationIdDto } from '../common/dto/invitationId.dto';
import { UpdateOtherDto } from './dto/updateOther.dto';
import { InstructorCoursesColumns, InstructorCoursesOrder } from '../common/enums/sort.enum';
import { DurationDto } from '../common/dto/duration.dto';
import { RecentActivityDto } from './dto/recentActivity.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ActivityTypes } from '../activities/activity.model';
import { UserActivities } from '../activities/userActivityCategory.model';
import { NotificationsService } from '../notifications/notifications.service';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import { UserRoles } from './user.model';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
const sharp = require('sharp');
import * as fs from 'fs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly collegesService: CollegesService,
    private readonly stripeService: StripeService,
    private readonly userTokensService: UserTokensService,
    private readonly invitationsService: InvitationsService,
    private readonly activitiesService: ActivitiesService,
    private readonly payoutsService: PayoutsService,
    private readonly transactionsService: TransactionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of users.' })
  @Get()
  async GetAllUsers(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;

    return await this.usersService.getUsers(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator', 'manager', 'instructor')
  @ApiOperation({ summary: 'Get a paginated list of users.' })
  @Get('list')
  async GetAllUsersList(@Query() keywordDto: KeywordDto, @GetUser() user) {
    keywordDto.collegeId = user.collegeId ? user.collegeId : keywordDto.collegeId;
    return await this.usersService.getUsersList(keywordDto, user.emailAddress);
  }

  @ApiOperation({ summary: 'Verify token and return user.' })
  @Get('bytoken')
  async GetUserByToken(@Query() tokenDto: TokenDto) {
    const token = await this.userTokensService.verifyToken({ token: encodeURIComponent(tokenDto.token), password: '' });

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }
    const user = await this.usersService.getUserById(token.userId);

    return user ? ResponseHandler.success(user) : ResponseHandler.fail(responseMessages.common.invalidToken);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user profile details.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get('/profile')
  async GetProfileData(@GetUser() user) {
    const [userData, recentActivities] = await Promise.all([
      this.usersService.getUserById(user._id),
      this.activitiesService.getActivities({
        type: 'user',
        userId: user._id,
        start: new Date(
          moment()
            .subtract(1, 'd')
            .toISOString(),
        ),
        end: new Date(),
        page: 1,
        perPage: Infinity,
      }),
    ]);

    return ResponseHandler.success({
      user: userData,
      recentActivities: recentActivities.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user profile details.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Get('/profile/recent-activity')
  async GetUserRecentActivities(@Query() durationDto: DurationDto, @GetUser() user) {
    return await this.activitiesService.getActivities({
      type: 'user',
      userId: user._id,
      start: durationDto.start, // new Date(moment().subtract(1, 'd').toISOString()),
      end: durationDto.end,
      page: 1,
      perPage: Infinity,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get user details by id.' })
  @Get('/details/:userId')
  async GetUserDetails(@Param() userIdDto: UserIdDto) {
    const user = await this.usersService.getUserById(userIdDto.userId);
    return ResponseHandler.success(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user details.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/uploads/users-images/');
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  @Post('update')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  async UpdateUserDetails(@Body() updateUserDto: UpdateUserDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    if (user.emailAddress !== updateUserDto.emailAddress) {
      const oldUser = await this.usersService.getUserByEmail(updateUserDto.emailAddress);

      if (oldUser) {
        return ResponseHandler.fail(responseMessages.common.emailRegistered);
      }
    }

    if (files && files.profilePhoto && files.profilePhoto[0]) {
      updateUserDto.profilePhoto = USERS_IMG_PATH + files.profilePhoto[0].filename;

      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      updateUserDto.profilePhotoThumbnail = (USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(USERS_IMG_PATH, files);
        files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
        files.profilePhotoThumbnail = [
          {
            ...files.profilePhoto[0],
            buffer: await sharp(files.profilePhoto[0].path)
              .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.profilePhoto[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(USERS_IMG_PATH, files);
      }
    }
    updateUserDto.bio = updateUserDto.bio ? updateUserDto.bio : null;

    return await this.usersService.updateDetails(updateUserDto, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Update user details.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/uploads/users-images/');
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  @Post('update/other')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  async UpdateOtherUserDetails(@Body() updateOtherDto: UpdateOtherDto, @UploadedFiles() files): Promise<SuccessInterface> {
    updateOtherDto.bio = updateOtherDto.bio ? updateOtherDto.bio : null;
    updateOtherDto.profilePhoto = updateOtherDto.profilePhotoPath;
    updateOtherDto.profilePhotoThumbnail = updateOtherDto.profilePhotoPath ? updateOtherDto.profilePhotoPath.replace('.', '_t.') : null;
    if (files && files.profilePhoto && files.profilePhoto[0]) {
      updateOtherDto.profilePhoto = USERS_IMG_PATH + files.profilePhoto[0].filename;

      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      updateOtherDto.profilePhotoThumbnail = (USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(USERS_IMG_PATH, files);
        files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
        files.profilePhotoThumbnail = [
          {
            ...files.profilePhoto[0],
            buffer: await sharp(files.profilePhoto[0].path)
              .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.profilePhoto[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(USERS_IMG_PATH, files);
      }
    }
    //  else {
    //   delete updateOtherDto.profilePhoto;
    //   delete updateOtherDto.profilePhotoThumbnail;
    // }
    const userData = await this.usersService.updateDetails(updateOtherDto, updateOtherDto.userId);

    return ResponseHandler.success(userData.data, responseMessages.success.updateUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user basic details.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/uploads/users-images/');
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  @Post('updateDetails')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  async UpdateUserBasicDetails(
    @Body() updateBasicDetailsDto: UpdateBasicDetailsDto,
    @GetUser() user,
    @UploadedFiles() files,
  ): Promise<SuccessInterface> {
    if (user.emailAddress !== updateBasicDetailsDto.emailAddress) {
      const oldUser = await this.usersService.getUserByEmail(updateBasicDetailsDto.emailAddress);

      if (oldUser) {
        return ResponseHandler.fail(responseMessages.common.emailRegistered);
      }
    }

    updateBasicDetailsDto.bio = updateBasicDetailsDto.bio ? updateBasicDetailsDto.bio : null;
    updateBasicDetailsDto.profilePhoto = updateBasicDetailsDto.profilePhotoPath;
    updateBasicDetailsDto.profilePhotoThumbnail = updateBasicDetailsDto.profilePhotoPath
      ? updateBasicDetailsDto.profilePhotoPath.replace('.', '_t.')
      : null;
    if (files && files.profilePhoto && files.profilePhoto[0]) {
      updateBasicDetailsDto.profilePhoto = USERS_IMG_PATH + files.profilePhoto[0].filename;

      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      updateBasicDetailsDto.profilePhotoThumbnail = (USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(USERS_IMG_PATH, files);
        files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
        files.profilePhotoThumbnail = [
          {
            ...files.profilePhoto[0],
            buffer: await sharp(files.profilePhoto[0].path)
              .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.profilePhoto[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(USERS_IMG_PATH, files);
      }
    }

    return await this.usersService.updateBasicDetails(updateBasicDetailsDto, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user notification preferences.' })
  @Post('updatePreferences')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateUserPreferences(@Body() updatePreferencesDto: UpdatePreferencesDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.usersService.updatePreferences(updatePreferencesDto, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user password.' })
  @Post('updatePassword')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateUserPassword(@Body() updatePasswordDto: UpdatePasswordDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.usersService.changePassword(updatePasswordDto, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of instructors optionally by college.' })
  @Get('instructors')
  async GetInstructors(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getInstructors(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator', 'manager')
  @ApiOperation({ summary: 'Get a list of instructors for add course dropdown.' })
  @Get('/instructors/names')
  async GetInstructorNames(@Query() keywordDto: KeywordDto, @GetUser() user) {
    keywordDto.collegeId = user.collegeId ? user.collegeId : keywordDto.collegeId;
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';

    if (!user.collegeId && !keywordDto.collegeId) {
      return ResponseHandler.fail('College id is required.');
    }

    return await this.usersService.getInstructorNames(keywordDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'moderator', 'manager')
  @ApiOperation({ summary: 'Get a list of college users for employer apply for proposal.' })
  @Get('names')
  async GetUsersNames(@Query() keywordDto: KeywordDto, @GetUser() user) {
    keywordDto.collegeId = user.collegeId ? user.collegeId : keywordDto.collegeId ? keywordDto.collegeId : null;
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';

    return await this.usersService.getUsersNames(keywordDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of invited instructors optionally by college.' })
  @Get('/instructors/invited')
  async GetInvitedInstructors(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getInvitedInstructors(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get complete data for instructors section on admin panel.' })
  @Get('/instructors/admin-home')
  async GetCompleteInstructorsSectionData(@Query() instructorSectionDataDto: InstructorSectionDataDto, @GetUser() user) {
    instructorSectionDataDto.collegeId = user.collegeId ? user.collegeId : instructorSectionDataDto.collegeId;
    instructorSectionDataDto.keyword = instructorSectionDataDto.keyword ? instructorSectionDataDto.keyword : '';
    instructorSectionDataDto.page = instructorSectionDataDto.page ? Number(instructorSectionDataDto.page) : 1;
    instructorSectionDataDto.perPage = instructorSectionDataDto.perPage ? Number(instructorSectionDataDto.perPage) : 10;
    instructorSectionDataDto.sortOrder = instructorSectionDataDto.sortOrder === 'asc' ? '1' : '-1';

    const instructorResponse = await this.usersService.getInstructors(instructorSectionDataDto);

    return ResponseHandler.success({
      instructors: instructorResponse.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a csv list of instructors optionally by college.' })
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=instructors.csv')
  @Get('/instructors/csv')
  async GetInstructorsCsv(@Query() listDto: ListDto, @GetUser() user) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getInstructorsCsv(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of invited instructors optionally by college as csv.' })
  @Get('/instructors/invited/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=invited instructors.csv')
  async GetInvitedInstructorsCsv(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getInvitedInstructorsCsv(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get a paginated list of admins optionally by college.' })
  @Get('admins')
  async GetAdmins(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getAdmins(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get a paginated list of admins optionally by college.' })
  @Get('admins/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=admins.csv')
  async GetAdminsCsv(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getAdminsCsv(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get admin profile details.' })
  @Get('/admins/details')
  async getAdminDetails(@Query() userIdDto: UserIdDto): Promise<SuccessInterface> {
    // this function only applies condition on id, so we can also get admins
    return await this.usersService.getInstructorDetails(userIdDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get admin profile section data.' })
  @Get('/admins-profile')
  async getAdminProfileSectionDetails(@Query() userIdDto: UserIdDto): Promise<SuccessInterface> {
    // this function only applies condition on id, so we can also get admins
    const [admin, recentActivity] = await Promise.all([
      this.usersService.getInstructorDetails(userIdDto),
      this.activitiesService.getActivities({
        type: 'user',
        userId: userIdDto.userId,
        start: new Date(
          moment()
            .subtract(1, 'd')
            .toISOString(),
        ), // new Date(moment().subtract(1, 'd').toISOString()),
        end: new Date(),
        page: 1,
        perPage: Infinity,
      }),
    ]);

    return ResponseHandler.success({
      admin: admin.data.instructorDetails,
      recentActivity: recentActivity.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get instructor profile details.' })
  @Get('/admins-profile/recent-activity')
  async getAdminRecentActivity(@Query() recentActivityDto: RecentActivityDto): Promise<SuccessInterface> {
    const recentActivity = await this.activitiesService.getActivities({
      type: 'user',
      userId: recentActivityDto.userId,
      start: new Date(recentActivityDto.start),
      end: new Date(recentActivityDto.end),
      page: 1,
      perPage: Infinity,
    });

    return ResponseHandler.success(recentActivity.data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of invited admins optionally by college.' })
  @Get('/admins/invited')
  async GetInvitedAdmins(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getInvitedAdmins(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user role.' })
  @Post('/admins/role/:userId')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  async UpdateUserRole(@Param() userIdDto: UserIdDto, @Body('role') role: string, @GetUser() user) {
    return await this.usersService.updateRole({ userId: userIdDto.userId, role }, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get complete data for admin section on admin panel.' })
  @Get('/admins/admin-home')
  async GetCompleteAdminSectionData(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    const adminsResponse = await this.usersService.getAdmins(listDto);

    return ResponseHandler.success({
      admins: adminsResponse.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of invited admins optionally by college.' })
  @Get('/admins/invited/csv')
  async GetInvitedAdminsCsv(@Query() listDto: ListDto, @GetUser() user) {
    listDto.collegeId = user.collegeId ? user.collegeId : listDto.collegeId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';

    return await this.usersService.getInvitedAdminsCsv(listDto);
  }

  @ApiOperation({ summary: 'Add other users to college or admin portal.' })
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin')
  @Post('/create/other')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public' + USERS_IMG_PATH);
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  async addOtherUser(@Body() createUserDto: CreateUserDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    const token = await this.userTokensService.verifyToken({ token: encodeURIComponent(createUserDto.token), password: '' }, true);

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }

    createUserDto.userId = token.userId;

    createUserDto.password = await commonFunctions.getHash(createUserDto.password);
    // @ts-ignore
    createUserDto.invitation = 'accepted';
    createUserDto.profilePhoto = files && files.profilePhoto ? USERS_IMG_PATH + files.profilePhoto[0].filename : '';
    if (files && files.profilePhoto) {
      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      createUserDto.profilePhotoThumbnail = (USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(USERS_IMG_PATH, files);
        files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
        files.profilePhotoThumbnail = [
          {
            ...files.profilePhoto[0],
            buffer: await sharp(files.profilePhoto[0].path)
              .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.profilePhoto[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(USERS_IMG_PATH, files);
      }
    }

    const userResponse = await this.usersService.updateDetails(createUserDto, createUserDto.userId);
    await this.invitationsService.acceptInvitation(userResponse.data.emailAddress);

    const activities = [
      {
        type: ActivityTypes.User,
        user: mongoose.Types.ObjectId(userResponse.data._id),
        userRole: userResponse.data.role,
        userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(UserActivities.UserJoined)),
      },
    ];

    await this.activitiesService.createActivities(activities);
    this.notificationsService.userJoined(userResponse.data);

    return ResponseHandler.success(userResponse.data, responseMessages.success.registerdUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get profile of logged in admin.' })
  @Get('data')
  async getAdminProfileData(@GetUser() user) {
    return await this.usersService.getAdminData(user._id);
  }

  @ApiOperation({ summary: 'Get password reset link.' })
  @Post('forgotPassword')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async sendPasswordResetLink(@Body() emailDto: EmailDto): Promise<SuccessInterface> {
    const user = await this.usersService.getUserByEmail(emailDto.emailAddress);
    if (user && user.invitation !== 'pending') {
      const linkSent = await this.usersService.sendResetPasswordLink(user);
      if (linkSent) {
        return ResponseHandler.success({
          message: 'Password reset link sent to your email address',
        });
      } else {
        return ResponseHandler.fail('Unable to send email');
      }
    } else {
      return ResponseHandler.fail('Email not found');
    }
  }

  @ApiOperation({ summary: 'Reset user password.' })
  @Post('/reset/password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<SuccessInterface> {
    const token = await this.userTokensService.verifyToken(resetPasswordDto);

    if (token) {
      const updatePassword = await this.usersService.updatePassword(resetPasswordDto.password, token.userId);

      if (updatePassword) {
        return ResponseHandler.success({}, 'Password has been updated successfully');
      } else {
        return ResponseHandler.fail('User not found');
      }
    } else {
      return ResponseHandler.fail('Token is invalid or expired');
    }
  }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a user account.' })
  // @Post('create')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'profilePhoto', maxCount: 1 },
  // ], {
  //   storage: diskStorage({
  //     destination: (req, file, cb) => {
  //       cb(null, './public/uploads/users-images/');
  //     },
  //     filename: (req, file, cb) => {
  //       let name = file.originalname.split('.');
  //       cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
  //     },
  //     // onError: err => {},
  //   }),
  // }))
  // async addUser(@Body() createUserDto: CreateUserDto, @UploadedFiles() files): Promise<SuccessInterface> {
  //   const response = await this.usersService.checkIfEmailExists(createUserDto.emailAddress);

  //   if (response.data) {
  //     return ResponseHandler.fail('Email already exists');
  //   }

  //   createUserDto.profilePhoto = files && files.profilePhoto ? USERS_IMG_PATH + files.profilePhoto[0].filename : '';
  //   return await this.usersService.insertUser(createUserDto);
  // }

  @ApiOperation({ summary: 'Check whether an email is already registered.' })
  @Post('check-email')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async checkIfEmailExists(@Body() emailDto: EmailDto): Promise<SuccessInterface> {
    return await this.usersService.checkIfEmailExists(emailDto.emailAddress.toLowerCase());
  }

  @ApiOperation({ summary: 'Add new user card to stripe' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('add-card')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async addCard(@Body() stripeTokenDto: StripeTokenDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.stripeService.addCard(user, stripeTokenDto.stripeToken);
  }

  @ApiOperation({ summary: 'Get user cards.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt') /*, RolesGuard*/)
  // @Roles('admin')
  @Get('get-cards')
  async getCards(@GetUser() user) {
    return await this.stripeService.getCards(user);
  }

  @Post('connect-account')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async connectStripeAccount(@Body('stripeToken') authToken, @GetUser() user) {
    return await this.stripeService.connectStripeAccount(user, authToken);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Post('create-payout')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async createPayoutForCollege(@Body('amount') amount: number, @GetUser() user) {
    const college = await this.collegesService.getCollegeById(user.collegeId);
    if (college.data.stripeId) {
      const response = await this.stripeService.createPayoutOnConnectAccount(college.data.stripeId, amount * 100);
      await this.payoutsService.addPayout({
        userId: user._id,
        amount,
        collegeId: user.collegeId,
      });
      return ResponseHandler.success(response.data);
    } else {
      return ResponseHandler.fail('You must connect a stripe account first.');
    }
  }

  @Get('get-balance')
  async getStripeAccountBalance() {
    return await this.stripeService.getConnectAccountBalance('acct_1G5tEhB97ucpAyyn');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get instructor details.' })
  @Get('/instructors/details')
  async getInstructorDetails(@Query() userIdDto: UserIdDto): Promise<SuccessInterface> {
    return await this.usersService.getInstructorDetails(userIdDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get instructor profile details.' })
  @Get('/instructors-profile')
  async getInstructorProfileSectionDetails(@Query() userIdDto: UserIdDto): Promise<SuccessInterface> {
    const [instructor, courses, recentActivity] = await Promise.all([
      this.usersService.getInstructorDetails(userIdDto),
      this.usersService.getInstructorCourses({
        userId: userIdDto.userId,
        column: InstructorCoursesColumns.courseName,
        order: InstructorCoursesOrder.Ascending,
        page: 1,
        perPage: Infinity,
      }),
      this.activitiesService.getActivities({
        type: 'user',
        userId: userIdDto.userId,
        start: new Date(
          moment()
            .subtract(1, 'd')
            .toISOString(),
        ), // new Date(moment().subtract(1, 'd').toISOString()),
        end: new Date(),
        page: 1,
        perPage: Infinity,
      }),
    ]);

    return ResponseHandler.success({
      instructor: instructor.data.instructorDetails,
      courses: courses.data.List,
      recentActivity: recentActivity.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get instructor profile details.' })
  @Get('/instructors-profile/recent-activity')
  async getInstructorRecentActivity(@Query() recentActivityDto: RecentActivityDto): Promise<SuccessInterface> {
    const recentActivity = await this.activitiesService.getActivities({
      type: 'user',
      userId: recentActivityDto.userId,
      start: new Date(recentActivityDto.start),
      end: new Date(recentActivityDto.end),
      page: 1,
      perPage: Infinity,
    });

    return ResponseHandler.success(recentActivity.data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get top performing instructors.' })
  @Get('/instructors/analytics')
  async GetTopInstructors(@Query() durationDto: OptionalDurationPaginationDto): Promise<SuccessInterface> {
    durationDto.page = durationDto.page ? durationDto.page : 1;
    durationDto.perPage = durationDto.perPage ? durationDto.perPage : 10;

    return await this.usersService.getTopInstructors(durationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get instructor courses lists' })
  @Get('/instructors/courses')
  async getInstructorCourses(@Query() instructorCoursesListDto: InstructorCoursesListDto): Promise<SuccessInterface> {
    instructorCoursesListDto.page = 1;
    instructorCoursesListDto.perPage = Infinity;
    return await this.usersService.getInstructorCourses(instructorCoursesListDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get count of new and total college accounts added.' })
  @Get('/college-accounts/analytics')
  async GetCollegeAccountCounts(@Query() durationDto: OptionalDurationDto, @GetUser() user): Promise<SuccessInterface> {
    durationDto.collegeId = user.collegeId ? user.collegeId : null;

    const totalAccounts = await this.usersService.getCollegeAccountCounts({ collegeId: durationDto.collegeId });
    const newAccounts = await this.usersService.getCollegeAccountCounts(durationDto);

    return ResponseHandler.success({
      totalAccounts: totalAccounts.data,
      newAccounts: newAccounts.data,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: `Delete user's invitation.` })
  @Delete('delete-invitation')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async DeleteInvitation(@Query() invitationIdDto: InvitationIdDto): Promise<SuccessInterface> {
    const invitationResponse = await this.invitationsService.getInvitationById(invitationIdDto.invitationId);
    const invitation = invitationResponse.data;
    const user = await this.usersService.getUserByEmailMongoObj(invitation.emailAddress);
    if (invitation) {
      if (invitation.status === 'pending') {
        await Promise.all([
          this.invitationsService.deleteInvitation(invitationIdDto.invitationId),
          this.usersService.removeUser({ userId: user._id }),
        ]);
        return ResponseHandler.success({}, 'Invitation deleted successfully.');
      } else {
        user.isSuspended = true;
        await Promise.all([user.save(), this.invitationsService.deleteInvitation(invitationIdDto.invitationId)]);
        return ResponseHandler.success({}, 'Invitation deleted and user suspended successfully.');
      }
    } else {
      return ResponseHandler.fail('Invitation not found.');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user.' })
  @Delete(':userId')
  async RemoveUser(@Param() userIdDto: UserIdDto, @GetUser() user): Promise<SuccessInterface> {
    const userToDelete = await this.usersService.getUserByIdMongoObj(userIdDto.userId);
    if (
      (user.collegeId && !userToDelete.collegeId) ||
      (userToDelete.collegeId && user.collegeId && userToDelete.collegeId.toString() !== user.collegeId.toString())
    ) {
      return ResponseHandler.fail('You can only delete users of your own college');
    }
    if (user.role !== 'superadmin' && userToDelete.role === 'superadmin') {
      return ResponseHandler.fail('Cannot delete user of higher role.');
    }

    // await this.usersService.getUserById(userIdDto.userId);
    await this.usersService.removeUser(userIdDto);

    return ResponseHandler.success({}, responseMessages.success.deleteInstructor);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Suspend user.' })
  @Post('suspend')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async SuspendUser(@Body() userIdDto: UserIdDto, @GetUser() user): Promise<SuccessInterface> {
    const userToSuspend = await this.usersService.getUserByIdMongoObj(userIdDto.userId);
    const authorized = isAuthorized(userToSuspend, user);
    if (!authorized.isAuthorized) {
      return ResponseHandler.fail(authorized.msg);
    } else {
      userToSuspend.isSuspended = !userToSuspend.isSuspended;
      const res = await userToSuspend.save();
      return ResponseHandler.success({ user: res });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user permission level.' })
  @Post('/update/roles')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateUserRoles(@Body() updateUserRoleDto: UpdateUserRoleDto, @GetUser() user) {
    return await this.usersService.updateRole(updateUserRoleDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get users notifications.' })
  @Get('notifications')
  async GetNotifications(@Query() paginationDto: PaginationDto, @GetUser() user) {
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 4;
    return await this.usersService.getUserNotifications(paginationDto, user);
  }
}
