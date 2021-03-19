import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmployerAdminsService } from './employer-admins.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailDto } from '../common/dto/email.dto';
import { ResetPasswordDto } from '../users/dto/resetPassword.dto';
import { TokenDto } from '../users/dto/token.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PROFILE_PHOTO_THUMBNAIL_SIZE, EMPLOYER_ADMINS_IMG_PATH } from '../config/config';
import { diskStorage } from 'multer';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListDto } from '../common/dto/list.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { EmployerAdminInvitationsService } from '../employer-admin-invitations/employer-admin-invitations.service';

import * as fs from 'fs';
import commonFunctions from '../common/functions';
import responseMessages from '../config/responseMessages';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import sharp = require('sharp');
import { EmployerAdminIdDto } from '../common/dto/employerAdminId.dto';
import { isAuthorized } from '../common/validators';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateEmployerAdminPreferencesDto } from './dto/updateEmployerAdminPreferences.dto';
import { UpdateEmployerAdminRoleDto } from './dto/update-employer-admin-role.dto';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
import { StripeTokenDto } from '../common/dto/stripeToken.dto';
import { StripeService } from '../stripe/stripe.service';
import { EmployerSubscriptionsService } from 'src/employer-subscriptions/employer-subscriptions.service';

@ApiTags('Employers Portal - Admins')
@Controller('employer-admins')
export class EmployerAdminsController {
  constructor(
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly employerAdminInvitationsService: EmployerAdminInvitationsService,
    private readonly notificationsService: NotificationsService,
    private readonly stripeService: StripeService,
    private readonly employerSubscriptionsService: EmployerSubscriptionsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Get employer admins list.' })
  @Get()
  async getAdminsList(@Query() listDto: ListDto, @GetUser() user) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? listDto.page : 1;
    listDto.perPage = listDto.perPage ? listDto.perPage : 10;
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.employerId = user.employerId ? user.employerId : listDto.employerId;

    return await this.employerAdminsService.getAdminsList(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Get employer admins list.' })
  @Get('names')
  async getAdminNamesList(@Query() listDto: ListDto, @GetUser() user) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.employerId = user.employerId ? user.employerId : listDto.employerId;

    return await this.employerAdminsService.getAdminNamesList(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get employer admin list as csv.' })
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=Employer Admins.csv')
  @Get('csv')
  async getAdminsListCsv(@Query() listDto: ListDto, @GetUser() user) {
    listDto.employerId = user.employerId ? user.employerId : listDto.employerId;
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    return await this.employerAdminsService.getAdminsListCsv(listDto);
  }

  @ApiOperation({ summary: 'Add other admins to employer portal.' })
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
          fs.mkdir('./public' + EMPLOYER_ADMINS_IMG_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + EMPLOYER_ADMINS_IMG_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  async addOtherAdmin(@Body() createUserDto: CreateUserDto, @GetUser() user, @UploadedFiles() files): Promise<SuccessInterface> {
    const token = await this.employerAdminsService.verifyToken(
      {
        token: encodeURIComponent(createUserDto.token),
        password: '',
      },
      true,
    );

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }

    createUserDto.password = await commonFunctions.getHash(createUserDto.password);
    // @ts-ignore
    createUserDto.invitation = 'accepted';
    createUserDto.profilePhoto = files && files.profilePhoto ? EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename : '';
    if (files && files.profilePhoto) {
      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      createUserDto.profilePhotoThumbnail = (EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(EMPLOYER_ADMINS_IMG_PATH, files);
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

        moveFilesToS3(EMPLOYER_ADMINS_IMG_PATH, files);
      }
    }

    const dt = new Date();
    createUserDto.joinDate = dt.toISOString();
    const userResponse = await this.employerAdminsService.updateDetails(createUserDto, token.adminId);
    await this.employerAdminInvitationsService.acceptInvitation(userResponse.data.emailAddress);

    // const activities = [
    //   {
    //     type: ActivityTypes.User,
    //     user: mongoose.Types.ObjectId(userResponse.data._id),
    //     userRole: userResponse.data.role,
    //     userActivity: mongoose.Types.ObjectId(await this.activitiesService.getUserActivityId(UserActivities.UserJoined)),
    //   },
    // ];
    //
    // await this.activitiesService.createActivities(activities);
    this.notificationsService.employerAdminJoined(userResponse.data);

    return ResponseHandler.success(userResponse.data, responseMessages.success.registerdUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update employer admin.' })
  @Post('update')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profilePhoto', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdir('./public' + EMPLOYER_ADMINS_IMG_PATH, { recursive: true }, err => {
            if (err) {
              return ResponseHandler.fail(err.message);
            }
            cb(null, './public' + EMPLOYER_ADMINS_IMG_PATH);
          });
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  async updateEmployerAdmin(@Body() updateAdminDto: UpdateAdminDto, @GetUser() user, @UploadedFiles() files) {
    updateAdminDto.profilePhoto = updateAdminDto.profilePhotoPath;
    updateAdminDto.profilePhotoThumbnail = updateAdminDto.profilePhotoPath ? updateAdminDto.profilePhotoPath.replace('.', '_t.') : null;
    if (files && files.profilePhoto && files.profilePhoto[0]) {
      updateAdminDto.profilePhoto = EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename;

      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      updateAdminDto.profilePhotoThumbnail = (EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(EMPLOYER_ADMINS_IMG_PATH, files);
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

        moveFilesToS3(EMPLOYER_ADMINS_IMG_PATH, files);
      }
    }

    const adminId = updateAdminDto.adminId ? updateAdminDto.adminId : user._id;
    delete updateAdminDto.adminId;

    return await this.employerAdminsService.updateEmployerAdminById(updateAdminDto, adminId);
  }

  @ApiOperation({ summary: 'Add new user card to stripe' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('add-card')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async addCard(@Body() stripeTokenDto: StripeTokenDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.stripeService.addCardToEmployer(user, stripeTokenDto.stripeToken);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get profile of logged in employer admin.' })
  @Get('profile')
  async getEmployerAdminProfile(@GetUser() user) {
    return await this.employerAdminsService.getAdminById(user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get profile of logged in employer admin.' })
  @Get('data')
  async getEmployerAdminProfileData(@GetUser() user) {
    const { data } = await this.employerAdminsService.getAdminData(user._id);
    const { data: activeSubscription } = await this.employerSubscriptionsService.getActiveSubscription(user.employerId);
    const newUser = Object.assign({}, { ...data.user, activeSubscription });
    console.log(newUser);
    return ResponseHandler.success({ user: newUser });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get profile details of an employer admin.' })
  @Get('/details/:adminId')
  async getEmployerAdminDetails(@Param() employerAdminIdDto: EmployerAdminIdDto, @GetUser() user) {
    return await this.employerAdminsService.getAdminById(employerAdminIdDto.adminId);
  }

  @ApiOperation({ summary: 'Get password reset link.' })
  @Post('forgot-password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async sendPasswordResetLink(@Body() emailDto: EmailDto): Promise<SuccessInterface> {
    const admin = await this.employerAdminsService.getAdminByEmail(emailDto.emailAddress);
    if (admin && admin.invitation !== 'pending') {
      const linkSent = await this.employerAdminsService.sendResetPasswordLink(admin);
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user password.' })
  @Post('update-password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateEmployerAdminPassword(@Body() updatePasswordDto: UpdatePasswordDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.employerAdminsService.changePassword(updatePasswordDto, user._id);
  }

  @ApiOperation({ summary: 'Reset user password.' })
  @Post('reset-password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<SuccessInterface> {
    const token = await this.employerAdminsService.verifyToken(resetPasswordDto);

    if (token) {
      const updatePassword = await this.employerAdminsService.updatePassword(resetPasswordDto.password, token.adminId);

      if (updatePassword) {
        return ResponseHandler.success({}, 'Password has been updated successfully');
      } else {
        return ResponseHandler.fail('User not found');
      }
    } else {
      return ResponseHandler.fail('Token is invalid or expired');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update employer admin role.' })
  @Post('/role/:adminId')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateUserRole(
    @Param() employerAdminIdDto: EmployerAdminIdDto,
    @Body() updateEmployerAdminRole: UpdateEmployerAdminRoleDto,
    @GetUser() user,
  ) {
    updateEmployerAdminRole.adminId = employerAdminIdDto.adminId;
    return await this.employerAdminsService.updateRole(updateEmployerAdminRole, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user.' })
  @Delete(':adminId')
  async RemoveAdmin(@Param() employerAdminIdDto: EmployerAdminIdDto, @GetUser() user): Promise<SuccessInterface> {
    const adminToDelete = await this.employerAdminsService.getAdminById(employerAdminIdDto.adminId, false);
    if ((user.employerId && !adminToDelete.employerId) || adminToDelete.employerId.toString() !== user.employerId.toString()) {
      return ResponseHandler.fail('You cannot delete this admin.');
    }
    if (user.role !== 'superadmin' && adminToDelete.role === 'superadmin') {
      return ResponseHandler.fail('You cannot delete user of higher role.');
    }

    // await this.usersService.getUserById(userIdDto.userId);
    await this.employerAdminsService.removeUser(employerAdminIdDto.adminId);

    return ResponseHandler.success({}, 'You successfully deleted the user.');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Suspend user.' })
  @Post('suspend')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async SuspendUser(@Body() employerAdminIdDto: EmployerAdminIdDto, @GetUser() user): Promise<SuccessInterface> {
    const adminToSuspend = await this.employerAdminsService.getAdminById(employerAdminIdDto.adminId, false);
    const authorized = isAuthorized(adminToSuspend, user);
    if (!authorized.isAuthorized) {
      return ResponseHandler.fail(authorized.msg);
    } else {
      adminToSuspend.isSuspended = !adminToSuspend.isSuspended;
      const res = await adminToSuspend.save();
      return ResponseHandler.success({ user: res });
    }
  }

  @ApiOperation({ summary: 'Verify token and return employer admin.' })
  @Get('by-token')
  async GetAdminByToken(@Query() tokenDto: TokenDto) {
    const token = await this.employerAdminsService.verifyToken({
      token: encodeURIComponent(tokenDto.token),
      password: '',
    });

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }
    const admin = await this.employerAdminsService.getAdminById(token.adminId);

    return admin ? ResponseHandler.success(admin) : ResponseHandler.fail(responseMessages.common.invalidToken);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get users notifications.' })
  @Get('notifications')
  async GetNotifications(@Query() paginationDto: PaginationDto, @GetUser() user) {
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 4;
    return await this.employerAdminsService.getEmployerAdminNotifications(paginationDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update user notification preferences.' })
  @Post('updatePreferences')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateUserPreferences(
    @Body() updateEmployerAdminPreferencesDto: UpdateEmployerAdminPreferencesDto,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    return await this.employerAdminsService.updatePreferences(updateEmployerAdminPreferencesDto, user._id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize contact unmudl chats for a user.' })
  @Post('init-contact-unmudl-for-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles()
  @ApiConsumes('application/x-www-form-urlencoded')
  async initializeContactUnmudlChatsForAllEmployerAdmins(@GetUser() user) {
    if (user.employerId || user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    return await this.employerAdminsService.initializeContactUnmudlChatsForAllEmployerAdmins();
  }
}
