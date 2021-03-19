import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
  Header,
  Param,
  HttpCode,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SignUpCollegeDto } from './dto/signUpCollege.dto';
import { ListDto } from '../common/dto/list.dto';
import { CollegesService } from './colleges.service';
import { UsersService } from '../users/users.service';
import { SuccessInterface } from '../common/ResponseHandler';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateCollegeDto } from './dto/updateCollege.dto';
import {
  COLLEGES_IMG_PATH,
  USERS_IMG_PATH,
  COLLEGE_LOGO_THUMBNAIL_SIZE,
  PROFILE_PHOTO_THUMBNAIL_SIZE,
} from '../config/config';
import { OptionalDurationPaginationDto } from '../common/dto/optionalDurationPagination.dto';
import { StripeService } from '../stripe/stripe.service';
import { PayoutsService } from '../payouts/payouts.service';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { GetCountDto } from '../common/dto/getCount.dto';
import { CollegeIdDto } from '../common/dto/collegeId.dto';
import { IntervalDto } from '../common/dto/interval.dto';
import { TokenDto } from '../users/dto/token.dto';
import { CollegeInvitationsService } from '../college-invitations/college-invitations.service';
import { FinanceSummaryDto } from './dto/financeSummary.dto';
import { KeywordDto } from '../common/dto/keyword.dto';
import { ActivitiesService } from '../activities/activities.service';
import { RecentActivityDto } from '../users/dto/recentActivity.dto';
import { TransactionActivityCsvDto } from '../activities/dto/transactionActivityCsv.dto';
import { PartnerGroupIdDto } from '../common/dto/partnerGroupId.dto';
import { UpdatePartnerCommissionDto } from './dto/updatePartnerCommission.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';

import * as json2csv from 'json2csv';
import moment = require('moment');
import sharp = require('sharp');
import AdminHomeDto from './dto/adminHomeDto.dto';
import StatsDto from './dto/stats.dto';
import responseMessages from '../config/responseMessages';
import ResponseHandler from '../common/ResponseHandler';
import { LocationDto } from './dto/location.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { OptionalCollegeIdDto } from '../common/dto/optionalCollegeId.dto';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
import * as fs from 'fs';
import { CollegesListDto } from './dto/collegesList.dto';
import { Keyword } from 'aws-sdk/clients/networkfirewall';

@ApiTags('College')
@Controller('colleges')
export class CollegesController {
  constructor(
    private readonly collegesService: CollegesService,
    private readonly collegeInvitationsService: CollegeInvitationsService,
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
    private readonly payoutService: PayoutsService,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {
  }

  @ApiOperation({ summary: 'Verify token and return college.' })
  @Get('bytoken')
  async GetCollegeByToken(@Query() tokenDto: TokenDto) {
    const token = await this.collegesService.verifyToken(encodeURIComponent(tokenDto.token));

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }

    return ResponseHandler.success(token.college);
  }

  @ApiOperation({ summary: 'College Signup: All data from the four steps of sign-up will be sent to create a new college account.' })
  @Post('create')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'collegeLogo', maxCount: 1 },
        { name: 'collegeBanner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'profilePhoto') {
              cb(null, './public' + USERS_IMG_PATH);
            } else if (file.fieldname === 'collegeLogo') {
              cb(null, './public' + COLLEGES_IMG_PATH);
            } else if (file.fieldname === 'collegeBanner') {
              cb(null, './public' + COLLEGES_IMG_PATH);
            }
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  async create(@Body() signUpCollegeDto: SignUpCollegeDto, @UploadedFiles() files): Promise<SuccessInterface> {
    const token = await this.collegesService.verifyToken(encodeURIComponent(signUpCollegeDto.token), true);

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }

    signUpCollegeDto._id = token.college._id;

    // const check = await this.usersService.checkIfEmailExists(signUpCollegeDto.emailAddress);
    if (files && files.collegeLogo) {
      await sharp(files.collegeLogo[0].path)
        .resize(COLLEGE_LOGO_THUMBNAIL_SIZE)
        .toFile(files.collegeLogo[0].path.replace('.', '_t.'));
      signUpCollegeDto.collegeLogoThumbnail = (COLLEGES_IMG_PATH + files.collegeLogo[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGES_IMG_PATH, files);
        files.collegeLogo[0].buffer = fs.readFileSync(files.collegeLogo[0].path);
        files.collegeLogoThumbnail = [
          {
            ...files.collegeLogo[0],
            buffer: await sharp(files.collegeLogo[0].path)
              .resize(COLLEGE_LOGO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.collegeLogo[0].filename.replace('.', '_t.'),
          },
        ];
        if (files && files.collegeBanner) {
          files.collegeBanner[0].buffer = fs.readFileSync(files.collegeBanner[0].path);
        }

        moveFilesToS3(COLLEGES_IMG_PATH, files);
      }
    }
    // if (!check.data) {
    signUpCollegeDto.collegeLogo = files && files.collegeLogo ? COLLEGES_IMG_PATH + files.collegeLogo[0].filename : '';
    signUpCollegeDto.collegeBanner = files && files.collegeBanner ? COLLEGES_IMG_PATH + files.collegeBanner[0].filename : '';
    signUpCollegeDto.invitation = 'accepted';
    const college = await this.collegesService.updateCollege(signUpCollegeDto);
    const invitation = await this.collegeInvitationsService.updateAcceptedInvitation(college.data._id);
    signUpCollegeDto.collegeId = college.data._id;
    signUpCollegeDto.role = 'superadmin';

    if (files && files.profilePhoto) {
      await sharp(files.profilePhoto[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      signUpCollegeDto.profilePhotoThumbnail = (USERS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

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
        // console.log(files);
        moveFilesToS3(USERS_IMG_PATH, files);
      }
    }
    signUpCollegeDto.profilePhoto = files && files.profilePhoto ? USERS_IMG_PATH + files.profilePhoto[0].filename : '';

    const user = await this.usersService.updateCollegeAdmin({
      emailAddress: invitation.emailAddress,
      fullname: signUpCollegeDto.fullname,
      password: signUpCollegeDto.password,
      profilePhoto: signUpCollegeDto.profilePhoto,
      profilePhotoThumbnail: signUpCollegeDto.profilePhotoThumbnail,
      designation: signUpCollegeDto.designation,
      invitation: 'accepted',
    });
    const { fullname, emailAddress, role, collegeId, designation } = user;
    const userResponse = { fullname, emailAddress, role, collegeId, designation };

    const collegeResponse = college.data;

    delete collegeResponse.salesTax;
    delete collegeResponse.unmudlShare;

    this.notificationsService.collegeJoined(collegeResponse, invitation.invitedBy);

    return ResponseHandler.success({
      user: userResponse,
      college: collegeResponse,
    });
    // } else {
    //   return ResponseHandler.fail('Email already registered');
    // }
  }

  @ApiOperation({ summary: 'College update.' })
  @Post('update-college/:collegeId')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'collegeLogo', maxCount: 1 },
        { name: 'collegeBanner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            cb(null, './public' + COLLEGES_IMG_PATH);
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
        }),
      },
    ),
  )
  async Update(
    @Param() collegeIdDto: CollegeIdDto,
    @Body() updateCollegeDto: UpdateCollegeDto,
    @UploadedFiles() files,
  ): Promise<SuccessInterface> {
    if (files && files.collegeLogo) {
      await sharp(files.collegeLogo[0].path)
        .resize(COLLEGE_LOGO_THUMBNAIL_SIZE)
        .toFile(files.collegeLogo[0].path.replace('.', '_t.'));
      updateCollegeDto.collegeLogoThumbnail = (COLLEGES_IMG_PATH + files.collegeLogo[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGES_IMG_PATH, files);
        files.collegeLogo[0].buffer = fs.readFileSync(files.collegeLogo[0].path);
        files.collegeLogoThumbnail = [
          {
            ...files.collegeLogo[0],
            buffer: await sharp(files.collegeLogo[0].path)
              .resize(COLLEGE_LOGO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.collegeLogo[0].filename.replace('.', '_t.'),
          },
        ];
        if (files && files.collegeBanner) {
          files.collegeBanner[0].buffer = fs.readFileSync(files.collegeBanner[0].path);
        }

        moveFilesToS3(COLLEGES_IMG_PATH, files);
      }
    } else {
      updateCollegeDto.collegeLogoThumbnail = updateCollegeDto.collegeLogoPath
        ? updateCollegeDto.collegeLogoPath.replace('.', '_t.')
        : null;
    }
    updateCollegeDto.collegeLogo =
      files && files.collegeLogo ? COLLEGES_IMG_PATH + files.collegeLogo[0].filename : updateCollegeDto.collegeLogoPath;
    updateCollegeDto.collegeBanner =
      files && files.collegeBanner ? COLLEGES_IMG_PATH + files.collegeBanner[0].filename : updateCollegeDto.collegeBannerPath;
    updateCollegeDto._id = collegeIdDto.collegeId;
    updateCollegeDto.streetAddress = updateCollegeDto.streetAddress ? updateCollegeDto.streetAddress : null;

    // if (!updateCollegeDto.collegeLogo) {
    //   delete updateCollegeDto.collegeLogo;
    // }

    // if (!updateCollegeDto.collegeBanner) {
    //   delete updateCollegeDto.collegeBanner;
    // }

    const college = await this.collegesService.updateCollege(updateCollegeDto);
    const collegeResponse = college.data;

    delete collegeResponse.salesTax;
    delete collegeResponse.unmudlShare;

    return ResponseHandler.success({
      college: collegeResponse,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update commission of a partner.' })
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @Post('/update-partner-commission/:collegeId')
  async updatePartnerCommission(@Body() updatePartnerCommissionDto: UpdatePartnerCommissionDto, @Param() collegeIdDto: CollegeIdDto) {
    return await this.collegesService.updatePartnerCommission(collegeIdDto.collegeId, updatePartnerCommissionDto.commission);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Change the group a partner belongs to.' })
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @Post('/update-partner-group/:collegeId')
  async updatePartnerGroup(@Param() collegeIdDto: CollegeIdDto, @Body() partnerGroupIdDto: PartnerGroupIdDto) {
    return await this.collegesService.updatePartnerGroup(collegeIdDto.collegeId, partnerGroupIdDto.partnerGroupId);
  }

  @Post('check-email')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async checkIfEmailExists(@Body('emailAddress') emailAddress: string): Promise<SuccessInterface> {
    return await this.usersService.checkIfEmailExists(emailAddress.toLowerCase());
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get colleges by location.' })
  @Get('by-location')
  async getCollegesByLocation(@Query() locationDto: LocationDto) {
    return await this.collegesService.getCollegesByLocation(locationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get colleges by location.' })
  @Get('/employer-portal/by-location')
  async getCollegesByLocationForEmployerPortal(@Query() locationDto: LocationDto, @GetUser() user) {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    return await this.collegesService.getCollegesByLocationForEmployerPortal(locationDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get colleges list for employers portal.' })
  @Get('employer-portal')
  async getCollegesForEmployerPortal(@Query() keywordDto: KeywordDto, @GetUser() user) {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    return await this.collegesService.getCollegesForEmployerPortal(keywordDto.keyword ? keywordDto.keyword : '', user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: `Get user's college.` })
  @Get('profile')
  async GetUsersCollege(@Query() collegeIdDto: OptionalCollegeIdDto, @GetUser() user): Promise<SuccessInterface> {
    if (!user.collegeId && !collegeIdDto.collegeId) {
      ResponseHandler.fail(responseMessages.common.requiredCollegeId);
    }

    collegeIdDto.collegeId = user.collegeId ? user.collegeId : collegeIdDto.collegeId;

    const [college, recentActivities] = await Promise.all([
      this.collegesService.getCollegeById(collegeIdDto.collegeId),
      this.activitiesService.getActivities({
        type: 'user',
        collegeId: collegeIdDto.collegeId,
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

    return ResponseHandler.success({ college: college.data, recentActivities: recentActivities.data });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: `Get user's college's recent activity.` })
  @Get('/profile/recent-activity')
  async GetCollegeRecentActivity(@GetUser() user, @Query() recentActivityDto: RecentActivityDto): Promise<SuccessInterface> {
    const collegeId = user.collegeId ? user.collegeId : recentActivityDto.collegeId;

    if (collegeId) {
      const recentActivities = await this.activitiesService.getActivities({
        collegeId,
        start: new Date(recentActivityDto.start),
        end: new Date(recentActivityDto.end),
        page: 1,
        perPage: Infinity,
      });

      return ResponseHandler.success(recentActivities.data);
    } else {
      return ResponseHandler.fail('College Id is required');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Update college profile.' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'collegeLogo', maxCount: 1 },
        { name: 'collegeBanner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            cb(null, './public/uploads/colleges-images/');
          },
          filename: (req, file, cb) => {
            let name = file.originalname.split('.');
            cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
          },
          // onError: err => {},
        }),
      },
    ),
  )
  @Post('update')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  async UpdateCollegeProfile(
    @Body() updateCollegeDto: UpdateCollegeDto,
    @GetUser() user,
    @UploadedFiles() files,
  ): Promise<SuccessInterface> {
    if (!user.collegeId) {
      ResponseHandler.fail(responseMessages.common.requiredCollegeId);
    }

    updateCollegeDto._id = user.collegeId;
    updateCollegeDto.streetAddress = updateCollegeDto.streetAddress ? updateCollegeDto.streetAddress : null;
    updateCollegeDto.collegeLogo = updateCollegeDto.collegeLogoPath;
    updateCollegeDto.collegeLogoThumbnail = updateCollegeDto.collegeLogoPath ? updateCollegeDto.collegeLogoPath.replace('.', '_t.') : null;
    if (files && files.collegeLogo && files.collegeLogo[0]) {
      updateCollegeDto.collegeLogo = COLLEGES_IMG_PATH + files.collegeLogo[0].filename;

      await sharp(files.collegeLogo[0].path)
        .resize(COLLEGE_LOGO_THUMBNAIL_SIZE)
        .toFile(files.collegeLogo[0].path.replace('.', '_t.'));
      updateCollegeDto.collegeLogoThumbnail = (COLLEGES_IMG_PATH + files.collegeLogo[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(COLLEGES_IMG_PATH, files);
        files.collegeLogo[0].buffer = fs.readFileSync(files.collegeLogo[0].path);
        files.collegeLogoThumbnail = [
          {
            ...files.collegeLogo[0],
            buffer: await sharp(files.collegeLogo[0].path)
              .resize(COLLEGE_LOGO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.collegeLogo[0].filename.replace('.', '_t.'),
          },
        ];
        if (files && files.collegeBanner) {
          files.collegeBanner[0].buffer = fs.readFileSync(files.collegeBanner[0].path);
        }

        moveFilesToS3(COLLEGES_IMG_PATH, files);
      }
    }

    updateCollegeDto.collegeBanner = updateCollegeDto.collegeBannerPath;
    if (files && files.collegeBanner && files.collegeBanner[0]) {
      updateCollegeDto.collegeBanner = COLLEGES_IMG_PATH + files.collegeBanner[0].filename;
    }

    return await this.collegesService.updateCollege(updateCollegeDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of registered colleges.' })
  @Get()
  async GetColleges(@Query() listDto: CollegesListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;
    listDto.state = listDto.state ? listDto.state : '';

    return await this.collegesService.getColleges(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of colleges names.' })
  @Get('names')
  async GetCollegeNamesList(@Query() listDto: ListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 50;

    return await this.collegesService.getCollegeNamesList(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of colleges names.' })
  @Get('/employer-portal/names')
  async getCollegeNamesListForEmployerPortal(@Query() listDto: ListDto, @GetUser() user): Promise<SuccessInterface> {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 50;

    return await this.collegesService.getCollegeNamesListForEmployerPortal(listDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator')
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Get a paginated list of registered colleges.' })
  @Get('dropdown')
  async GetCollegesDropdown(@Query() keywordDto: KeywordDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.collegesService.getCollegesDropdown(keywordDto.keyword);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get partner dashboard data.' })
  @Get('admin-home')
  async GetCollegeDashboard(@Query() adminHomeDto: AdminHomeDto, @GetUser() user): Promise<SuccessInterface> {
    adminHomeDto.perPage = Number(adminHomeDto.perPage) ? Number(adminHomeDto.perPage) : 10;
    adminHomeDto.interval = Number(adminHomeDto.interval);

    const [revenueStats, { data: totalColleges }, { data: newColleges }, growth, partners] = await Promise.all([
      this.collegesService.getCollegesRevenue({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
      this.collegesService.getCollegesCount({}),
      this.collegesService.getCollegesCount({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
      this.collegesService.getCollegeGrowth({
        start: adminHomeDto.graphStart,
        end: adminHomeDto.graphEnd,
        interval: adminHomeDto.interval,
      }),
      this.collegesService.getColleges({
        keyword: '',
        page: 1,
        perPage: adminHomeDto.perPage,
        sortBy: 'partner',
        sortOrder: '1',
      }),
    ]);
    // return await this.collegesService.getColleges(listDto);
    return ResponseHandler.success({
      stats: { totalColleges, newColleges, ...revenueStats },
      growth: growth.data,
      partners: { partners: partners.data.colleges, rows: partners.data.rows },
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get partner statistics.' })
  @Get('statistics')
  async GetCollegesStatistics(@Query() statsDto: StatsDto) {
    const [revenueStats, { data: totalColleges }, { data: newColleges }] = await Promise.all([
      this.collegesService.getCollegesRevenue(statsDto),
      this.collegesService.getCollegesCount({}),
      this.collegesService.getCollegesCount(statsDto),
    ]);

    const stats = {
      ...revenueStats,
      newColleges,
      totalColleges,
    };

    return ResponseHandler.success(stats);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin', 'manager', 'moderator')
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Get college details by id.' })
  @Get('/detail-by-id/:collegeId')
  async GetCollegeDetailsById(@Param() collegeIdDto: CollegeIdDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.collegesService.getCollegeById(collegeIdDto.collegeId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get college details by id.' })
  @Get('/details/:collegeId')
  async GetCollegeDetails(@Param() collegeIdDto: CollegeIdDto, @GetUser() user): Promise<SuccessInterface> {
    const {
      data: { totalRevenue, collegeRevenue, unmudlShare },
    } = await this.enrollmentsService.getRevenueAnalytics({ collegeId: collegeIdDto.collegeId });
    const { data: college } = await this.collegesService.getCollegeDetails(collegeIdDto);

    college.collegeEarnings = collegeRevenue;
    college.totalEarnings = collegeRevenue;
    college.sharedEarnings = unmudlShare;

    return ResponseHandler.success(college);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get colleges as csv.' })
  @Get('/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=partners.csv')
  async GetCollegesAsCsv(@Query() listDto: ListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';

    const response = await this.collegesService.getCollegesAsCsv(listDto);
    const fields = ['Partner Name', 'Total Courses Uploaded', 'Total Earnings', 'Total Earnings Shared', 'Commission Percentage'];
    return json2csv.parse(response.data, { fields });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get a paginated list of top registered colleges for admin dashboard.' })
  @Get('/analytics')
  async GetTopColleges(@Query() durationDto: OptionalDurationPaginationDto, @GetUser() user): Promise<SuccessInterface> {
    durationDto.page = durationDto.page ? durationDto.page : 1;
    durationDto.perPage = durationDto.perPage ? durationDto.perPage : 10;

    return await this.collegesService.getTopColleges(durationDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get count of registered colleges for admin analytics.' })
  @Get('/analytics/count')
  async GetCollegesCount(@Query() getCountDto: GetCountDto): Promise<SuccessInterface> {
    const newColleges = await this.collegesService.getCollegesCount(getCountDto);
    const totalColleges = await this.collegesService.getCollegesCount({});

    return ResponseHandler.success({
      newCount: newColleges.data,
      totalCount: totalColleges.data,
    });
  }

  @Post('connect-account')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async connectStripeAccount(@Body('stripeToken') authToken, @GetUser() user) {
    return await this.stripeService.connectStripeAccount(user, authToken);
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin')
  // @ApiOperation({ summary: 'Get college revenue graph.' })
  // @Get('/revenue/graph')
  // async GetCollegeRevenueGraph(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
  //   analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;
  //
  //   return await this.enrollmentsService.getRevenueAnalyticsForGraph(analyticsCountDto);
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get colleges growth graph.' })
  @Get('/graph')
  async GetCollegeGrowthGraph(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
    analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;

    return await this.collegesService.getCollegeGrowth(analyticsCountDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get colleges growth graph.' })
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=growth.csv')
  @Get('/graph/csv')
  async GetCollegeGrowthGraphAsCsv(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
    analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;

    const response = await this.collegesService.getCollegeGrowth(analyticsCountDto, true);

    const fields = ['Joined On', 'New Users Registered'];
    return json2csv.parse(response.data, { fields });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get total revenue, shared revenue, pending payments, earnings available and last transaction date.' })
  @Get('/finance-summary')
  async GetFinanceSummary(@GetUser() user, @Query('collegeId') collegeId: string): Promise<SuccessInterface> {
    collegeId = user.collegeId ? user.collegeId : collegeId ? collegeId : '';

    const {
      data: { totalRevenue, collegeRevenue, unmudlShare },
    } = await this.enrollmentsService.getRevenueAnalytics({ collegeId });
    const {
      data: { pendingPayments },
    } = await this.collegesService.getFinanceSummary(collegeId);

    if (collegeId) {
      const college = await this.collegesService.getCollegeById(collegeId);
      const accountBalance = await this.stripeService.getConnectAccountBalance(college.data.stripeId);
      const earningsAvailable =
        accountBalance.data.available && accountBalance.data.available.length > 0 && accountBalance.data.available[0].amount;
      const lastTransactionDate = await this.payoutService.getLastTransactionDate(collegeId);
      const refundChargeback = college.data.payableToUnmudl ? college.data.payableToUnmudl : 0;

      return ResponseHandler.success({
        totalRevenue,
        collegeRevenue,
        unmudlShare,
        pendingPayments,
        earningsAvailable,
        refundChargeback,
        lastTransactionDate: lastTransactionDate.data,
      });
    } else {
      return ResponseHandler.success({
        totalRevenue,
        collegeRevenue,
        unmudlShare,
        pendingPayments,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get finance summary dashboard.' })
  @Get('/finance-summary/admin-home')
  async GetFinanceSummaryDashboard(@Query() financeSummaryDto: FinanceSummaryDto, @GetUser() user): Promise<SuccessInterface> {
    const { stripeAuthCode } = financeSummaryDto;

    const collegeId = user.collegeId ? user.collegeId : financeSummaryDto.collegeId ? financeSummaryDto.collegeId : '';

    if (stripeAuthCode && stripeAuthCode !== 'null' && collegeId) {
      const college = await this.collegesService.getCollegeById(collegeId);
      // console.log(college.data.stripeId)
      if (!college.data.stripeId) {
        await this.stripeService.connectStripeAccount(user, stripeAuthCode);
      }
    }

    const {
      data: { totalRevenue, collegeRevenue, unmudlShare },
    } = await this.enrollmentsService.getRevenueAnalytics({ collegeId });
    const {
      data: { pendingPayments },
    } = await this.collegesService.getFinanceSummary(collegeId);

    const graphRevenue = await this.collegesService.getCollegeRevenueGraph({
      collegeId,
      start: financeSummaryDto.graphStart,
      end: financeSummaryDto.graphEnd,
      interval: 1,
    });

    const recentActivities = await this.collegesService.getTransactionActivities({
      collegeId,
      keyword: '',
      start: financeSummaryDto.activitiesStart,
      end: financeSummaryDto.activitiesEnd,
      page: 1,
      perPage: Infinity,
    });

    if (collegeId) {
      const college = await this.collegesService.getCollegeById(collegeId);

      const accountBalance = college.data.stripeId ? await this.stripeService.getConnectAccountBalance(college.data.stripeId) : null;
      const refundChargeback = college.data.payableToUnmudl ? college.data.payableToUnmudl : 0;
      const earningsAvailable =
        accountBalance &&
        accountBalance.data.available &&
        accountBalance.data.available.length > 0 &&
        accountBalance.data.available[0].amount;

      const lastTransactionDate = await this.payoutService.getLastTransactionDate(collegeId);
      const account = college.data.stripeId ? await this.stripeService.getStripeAccountDetails(college.data.stripeId) : null;

      const accountDetails = {
        title: account ? college.data.title : '',
        coverPhoto: account ? college.data.collegeLogo : '',
        balance: account ? earningsAvailable : 0,
      };

      return ResponseHandler.success({
        summary: {
          totalRevenue,
          collegeRevenue,
          refundChargeback,
          sharedRevenue: unmudlShare,
          pendingPayments,
          earningsAvailable,
          lastTransactionDate: lastTransactionDate.data,
        },
        graph: graphRevenue.data,
        stripeAccount: accountDetails,
        recentActivities: recentActivities.data,
      });
    } else {
      return ResponseHandler.success({
        summary: {
          totalRevenue,
          collegeRevenue,
          sharedRevenue: unmudlShare,
          pendingPayments,
        },
        graph: graphRevenue.data,
        recentActivities: recentActivities.data,
      });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get finance summary dashboard.' })
  @Get('/finance-summary/transaction-history')
  async GetTransactionHistoryForFinanceSummarySection(
    @GetUser() user,
    @Query() recentActivityDto: RecentActivityDto,
  ): Promise<SuccessInterface> {
    const collegeId = user.collegeId ? user.collegeId : recentActivityDto.collegeId ? recentActivityDto.collegeId : '';
    return await this.collegesService.getTransactionActivities({
      collegeId,
      keyword: recentActivityDto.keyword ? recentActivityDto.keyword : '',
      start: recentActivityDto.start,
      end: recentActivityDto.end,
      page: 1,
      perPage: Infinity,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get finance section transaction history csv.' })
  @Get('/finance-summary/transaction-history/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=transaction history.csv')
  async GetTransactionHistoryAsCsvForFinanceSummarySection(
    @GetUser() user,
    @Query() transactionActivityCsvDto: TransactionActivityCsvDto,
  ): Promise<SuccessInterface> {
    const collegeId = user.collegeId ? user.collegeId : transactionActivityCsvDto.collegeId ? transactionActivityCsvDto.collegeId : '';
    return await this.collegesService.getTransactionActivitiesCsv({
      collegeId,
      start: transactionActivityCsvDto.start,
      end: transactionActivityCsvDto.end,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get revenue graph data on finance summary section.' })
  @Get('/finance-summary/graph')
  async GetFinanceRevenueGraph(@GetUser() user, @Query() params: IntervalDto): Promise<SuccessInterface> {
    params.collegeId = user.collegeId ? user.collegeId : params.collegeId ? params.collegeId : '';

    const graphRevenue = await this.collegesService.getCollegeRevenueGraph(params);
    return ResponseHandler.success(graphRevenue.data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get revenue graph data on finance summary section.' })
  @Get('/finance-summary/graph/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=Revenue Growth.csv')
  async GetFinanceRevenueGraphCsv(@GetUser() user, @Query() params: IntervalDto): Promise<SuccessInterface> {
    params.collegeId = user.collegeId ? user.collegeId : params.collegeId ? params.collegeId : '';
    return await this.collegesService.getCollegeRevenueGraphAsCsv(params);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Suspend partner account.' })
  @Post('/suspend-unsuspend')
  @ApiConsumes('multipart/form-data')
  async SuspendUnsuspendCollege(@Body() collegeIdDto: CollegeIdDto, @GetUser() user) {
    return await this.collegesService.suspendUnsupendCollege(collegeIdDto.collegeId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Get unmudl admin access to college portal.' })
  @Post('/unmudl-admin/access')
  @ApiConsumes('application/x-www-form-urlencoded')
  async getUnmudlAdminCollegePortalAccessToken(@Body() collegeIdDto: CollegeIdDto, @GetUser() user) {
    if (user.type !== 'user' || user.collegeId) {
      return ResponseHandler.fail('Only Unmudl superadmin can access this route.');
    }

    return await this.collegesService.getUnmudlAdminCollegePortalAccessToken(collegeIdDto.collegeId, user);
  }
}
