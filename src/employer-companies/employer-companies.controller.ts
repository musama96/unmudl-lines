import { Body, Controller, Get, HttpCode, Post, Query, UploadedFiles, UseGuards, UseInterceptors, Header } from '@nestjs/common';
import { EmployerCompaniesService } from './employer-companies.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EMPLOYER_COMPANIES_IMG_PATH, EMPLOYER_ADMINS_IMG_PATH, EMPLOYER_COMPANIES_BANNER_PATH } from '../config/config';
import { EmployerInvitationsService } from '../employer-invitations/employer-invitations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmployerAdminsService } from '../employer-admins/employer-admins.service';
import { SignUpEmployerDto } from './dto/sign-up-employer.dto';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { diskStorage } from 'multer';
import sharp = require('sharp');
import { TokenDto } from '../users/dto/token.dto';
import responseMessages from '../config/responseMessages';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { EmployerCompanyIdDto } from '../common/dto/employerCompanyId.dto';
import { UpdateEmployerCompanyDto } from './dto/update-employer-company.dto';
import { RestrictCollegeUserGuard } from '../auth/restrictCollegeUser.guard';
import { RestrictCollegeUser } from '../auth/restrictCollegeUser.decorator';
import StatsDto from '../colleges/dto/stats.dto';
import { AnalyticsCountDto } from '../common/dto/analyticsCount.dto';
import { ListDto } from '../common/dto/list.dto';
import AdminHomeDto from '../colleges/dto/adminHomeDto.dto';
import * as json2csv from 'json2csv';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
import { EmployerAdminInvitationsService } from '../employer-admin-invitations/employer-admin-invitations.service';
import { EmployerSubscriptionsService } from 'src/employer-subscriptions/employer-subscriptions.service';

@ApiTags('Employers Portal - Employers')
@Controller('employer-companies')
export class EmployerCompaniesController {
  constructor(
    private readonly employerCompaniesService: EmployerCompaniesService,
    private readonly employerAdminsService: EmployerAdminsService,
    private readonly employerInvitationsService: EmployerInvitationsService,
    private readonly employerAdminInvitationsService: EmployerAdminInvitationsService,
    private readonly notificationsService: NotificationsService,
    private readonly employerSubscriptionsService: EmployerSubscriptionsService,
  ) {}

  @ApiOperation({ summary: 'Employer Signup: All data from the steps of sign-up will be sent to create a new employer account.' })
  @Post('signup')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'employerLogo', maxCount: 1 },
        { name: 'employerBanner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'profilePhoto') {
              fs.mkdir('./public' + EMPLOYER_ADMINS_IMG_PATH, { recursive: true }, err => {
                if (err) {
                  return ResponseHandler.fail(err.message);
                }
                cb(null, './public' + EMPLOYER_ADMINS_IMG_PATH);
              });
            } else if (file.fieldname === 'employerLogo') {
              fs.mkdir('./public' + EMPLOYER_COMPANIES_IMG_PATH, { recursive: true }, err => {
                if (err) {
                  return ResponseHandler.fail(err.message);
                }
                cb(null, './public' + EMPLOYER_COMPANIES_IMG_PATH);
              });
            } else if (file.fieldname === 'employerBanner') {
              fs.mkdir('./public' + EMPLOYER_COMPANIES_BANNER_PATH, { recursive: true }, err => {
                if (err) {
                  return ResponseHandler.fail(err.message);
                }
                cb(null, './public' + EMPLOYER_COMPANIES_BANNER_PATH);
              });
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
  async create(@Body() signUpEmployerDto: SignUpEmployerDto, @UploadedFiles() files): Promise<SuccessInterface> {
    const token = await this.employerCompaniesService.verifyToken(encodeURIComponent(signUpEmployerDto.token), true);

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }

    signUpEmployerDto._id = token.employer._id;

    // const check = await this.usersService.checkIfEmailExists(signUpEmployerDto.emailAddress);
    if (files && files.employerLogo) {
      await sharp(files.employerLogo[0].path)
        .resize({ height: 200, width: 200 })
        .toFile(files.employerLogo[0].path.replace('.', '_t.'));
      signUpEmployerDto.employerLogoThumbnail = (EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(EMPLOYER_COMPANIES_IMG_PATH, files);
        files.employerLogo[0].buffer = fs.readFileSync(files.employerLogo[0].path);
        files.employerLogoThumbnail = [
          {
            ...files.employerLogo[0],
            buffer: await sharp(files.employerLogo[0].path)
              .resize({ height: 200, width: 200 })
              .toBuffer(),
            filename: files.employerLogo[0].filename.replace('.', '_t.'),
          },
        ];
        if (files && files.employerBanner) {
          files.employerBanner[0].buffer = fs.readFileSync(files.employerBanner[0].path);
        }

        moveFilesToS3(EMPLOYER_COMPANIES_IMG_PATH, files);
      }
    }
    // if (!check.data) {
    signUpEmployerDto.employerLogo = files && files.employerLogo ? '/' + EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename : '';
    signUpEmployerDto.employerBanner =
      files && files.employerBanner ? '/' + EMPLOYER_COMPANIES_IMG_PATH + files.employerBanner[0].filename : '';
    signUpEmployerDto.invitation = 'accepted';
    const employerCompany = await this.employerCompaniesService.updateEmployer(signUpEmployerDto);
    const invitation = await this.employerInvitationsService.updateAcceptedInvitation(employerCompany.data._id);
    signUpEmployerDto.employerId = employerCompany.data._id;
    signUpEmployerDto.role = 'superadmin';

    if (files && files.profilePhoto) {
      await sharp(files.profilePhoto[0].path)
        .resize({ height: 200, width: 200 })
        .toFile(files.profilePhoto[0].path.replace('.', '_t.'));
      signUpEmployerDto.profilePhotoThumbnail = (EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(EMPLOYER_ADMINS_IMG_PATH, files);
        files.profilePhoto[0].buffer = fs.readFileSync(files.profilePhoto[0].path);
        files.profilePhotoThumbnail = [
          {
            ...files.profilePhoto[0],
            buffer: await sharp(files.profilePhoto[0].path)
              .resize({ height: 200, width: 200 })
              .toBuffer(),
            filename: files.profilePhoto[0].filename.replace('.', '_t.'),
          },
        ];
        // console.log(files);
        moveFilesToS3(EMPLOYER_ADMINS_IMG_PATH, files);
      }
    }
    signUpEmployerDto.profilePhoto = files && files.profilePhoto ? EMPLOYER_ADMINS_IMG_PATH + files.profilePhoto[0].filename : '';

    const user = await this.employerAdminsService.updateEmployerAdmin({
      emailAddress: invitation.emailAddress,
      fullname: signUpEmployerDto.fullname,
      password: signUpEmployerDto.password,
      profilePhoto: signUpEmployerDto.profilePhoto,
      profilePhotoThumbnail: signUpEmployerDto.profilePhotoThumbnail,
      designation: signUpEmployerDto.designation,
      invitation: 'accepted',
      joinDate: new Date(),
    });
    await this.employerAdminInvitationsService.acceptInvitation(invitation.emailAddress);
    const { fullname, emailAddress, role, employerCompanyId, designation } = user;
    const userResponse = { fullname, emailAddress, role, employerCompanyId, designation };

    const employerCompanyResponse = employerCompany.data;

    this.notificationsService.employerJoined(employerCompanyResponse, invitation.invitedBy);

    return ResponseHandler.success({
      user: userResponse,
      employer: employerCompanyResponse,
    });
  }

  @ApiOperation({ summary: 'Update employer details.' })
  @Post('update')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'employerLogo', maxCount: 1 },
        { name: 'employerBanner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'employerLogo') {
              fs.mkdir('./public' + EMPLOYER_COMPANIES_IMG_PATH, { recursive: true }, err => {
                if (err) {
                  return ResponseHandler.fail(err.message);
                }
                cb(null, './public' + EMPLOYER_COMPANIES_IMG_PATH);
              });
            } else if (file.fieldname === 'employerBanner') {
              fs.mkdir('./public' + EMPLOYER_COMPANIES_BANNER_PATH, { recursive: true }, err => {
                if (err) {
                  return ResponseHandler.fail(err.message);
                }
                cb(null, './public' + EMPLOYER_COMPANIES_BANNER_PATH);
              });
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
  async updateEmployer(
    @Body() updateEmployerCompanyDto: UpdateEmployerCompanyDto,
    @UploadedFiles() files,
    @GetUser() user,
  ): Promise<SuccessInterface> {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized');
    }
    // const check = await this.usersService.checkIfEmailExists(signUpEmployerDto.emailAddress);
    updateEmployerCompanyDto.employerLogoThumbnail = updateEmployerCompanyDto.employerLogoPath
      ? updateEmployerCompanyDto.employerLogoPath.replace('.', '_t.')
      : null;
    if (files && files.employerLogo) {
      await sharp(files.employerLogo[0].path)
        .resize({ height: 200, width: 200 })
        .toFile(files.employerLogo[0].path.replace('.', '_t.'));
      updateEmployerCompanyDto.employerLogoThumbnail = ('/' + EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename).replace(
        '.',
        '_t.',
      );

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(EMPLOYER_COMPANIES_IMG_PATH, files);
        files.employerLogo[0].buffer = fs.readFileSync(files.employerLogo[0].path);
        files.employerLogoThumbnail = [
          {
            ...files.employerLogo[0],
            buffer: await sharp(files.employerLogo[0].path)
              .resize({ height: 200, width: 200 })
              .toBuffer(),
            filename: files.employerLogo[0].filename.replace('.', '_t.'),
          },
        ];
        if (files && files.employerBanner) {
          files.employerBanner[0].buffer = fs.readFileSync(files.employerBanner[0].path);
        }

        moveFilesToS3(EMPLOYER_COMPANIES_IMG_PATH, files);
      }
    }
    // if (!check.data) {
    updateEmployerCompanyDto._id = user.employerId ? user.employerId : updateEmployerCompanyDto._id;

    if (!updateEmployerCompanyDto._id) {
      return ResponseHandler.fail('Employer id is required');
    }

    updateEmployerCompanyDto.employerLogo =
      files && files.employerLogo ? '/' + EMPLOYER_COMPANIES_IMG_PATH + files.employerLogo[0].filename : '';
    updateEmployerCompanyDto.employerBanner =
      files && files.employerBanner ? EMPLOYER_COMPANIES_IMG_PATH + files.employerBanner[0].filename : '';
    const { data: employer } = await this.employerCompaniesService.updateEmployer(updateEmployerCompanyDto);

    return ResponseHandler.success(employer);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Toggle suspend employer account.' })
  @Post('/toggle-suspend')
  @ApiConsumes('multipart/form-data')
  async SuspendUnsuspendCollege(@Body() employerCompanyIdDto: EmployerCompanyIdDto, @GetUser() user) {
    if (user.collegeId || user.employerId) {
      return ResponseHandler.fail('Only Unmudl can access this route.');
    }

    return await this.employerCompaniesService.toggleSuspendEmployer(employerCompanyIdDto.employerId);
  }

  @ApiOperation({ summary: 'Verify token and return employer.' })
  @Get('by-token')
  async GetEmployerByToken(@Query() tokenDto: TokenDto) {
    const token = await this.employerCompaniesService.verifyToken(encodeURIComponent(tokenDto.token));

    if (!token) {
      return ResponseHandler.fail(responseMessages.common.invalidToken);
    }

    return ResponseHandler.success({
      employer: token.employer,
      admin: token.admin,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard, RestrictCollegeUserGuard)
  @Roles('admin')
  @RestrictCollegeUser()
  @ApiOperation({ summary: 'Get college profile.' })
  @Get('profile')
  async getEmployerProfile(@Query() employerCompanyIdDto: EmployerCompanyIdDto, @GetUser() user) {
    const employerId = user.employerId ? user.employerId : employerCompanyIdDto.employerId;
    if (employerId) {
      return await this.employerCompaniesService.getEmployerById(employerId);
    } else {
      return ResponseHandler.fail('Employer id is required.');
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get a paginated list of registered colleges.' })
  @Get()
  async GetEmployers(@Query() listDto: ListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;

    return await this.employerCompaniesService.getEmployers(listDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get colleges as csv.' })
  @Get('/csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=partners.csv')
  async GetEmployersAsCsv(@Query() listDto: ListDto, @GetUser() user): Promise<SuccessInterface> {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'partner';
    listDto.page = Number(listDto.page) ? Number(listDto.page) : 1;
    listDto.perPage = Number(listDto.perPage) ? Number(listDto.perPage) : 10;

    const response = await this.employerCompaniesService.getEmployersAsCsv(listDto);
    const fields = ['Employer Name', 'Location', 'NAICS Code', 'Employees Size', 'Date of joining'];
    return json2csv.parse(response.data, { fields });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get employer dashboard data.' })
  @Get('admin-home')
  async GetEmployerDashboard(@Query() adminHomeDto: AdminHomeDto, @GetUser() user): Promise<SuccessInterface> {
    adminHomeDto.perPage = Number(adminHomeDto.perPage) ? Number(adminHomeDto.perPage) : 10;
    adminHomeDto.interval = Number(adminHomeDto.interval);

    const [/*revenueStats, */ { data: totalEmployers }, { data: newEmployers }, growth, employers] = await Promise.all([
      // this.employerCompaniesService.getEmployersRevenue({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
      this.employerCompaniesService.getEmployersCount({}),
      this.employerCompaniesService.getEmployersCount({ start: adminHomeDto.statsStart, end: adminHomeDto.statsEnd }),
      this.employerCompaniesService.getEmployerGrowth({
        start: adminHomeDto.graphStart,
        end: adminHomeDto.graphEnd,
        interval: adminHomeDto.interval,
      }),
      this.employerCompaniesService.getEmployers({
        keyword: '',
        page: 1,
        perPage: adminHomeDto.perPage,
        sortBy: 'partner',
        sortOrder: '1',
      }),
    ]);
    // return await this.collegesService.getColleges(listDto);
    return ResponseHandler.success({
      stats: { totalEmployers, newEmployers /*, ...revenueStats*/ },
      growth: growth.data,
      employers: { employers: employers.data.employers, rows: employers.data.rows },
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get partner statistics.' })
  @Get('statistics')
  async GetEmployersStatistics(@Query() statsDto: StatsDto) {
    const [/*revenueStats, */ { data: totalEmployers }, { data: newEmployers }] = await Promise.all([
      // this.employerCompaniesService.getEmployersRevenue(statsDto),
      this.employerCompaniesService.getEmployersCount({}),
      this.employerCompaniesService.getEmployersCount(statsDto),
    ]);

    const stats = {
      // ...revenueStats,
      newEmployers,
      totalEmployers,
    };

    return ResponseHandler.success(stats);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get colleges growth graph.' })
  @Get('/graph')
  async GetEmployerGrowthGraph(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
    analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;

    return await this.employerCompaniesService.getEmployerGrowth(analyticsCountDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @ApiOperation({ summary: 'Get colleges growth graph.' })
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=growth.csv')
  @Get('/graph/csv')
  async GetEmployerGrowthGraphAsCsv(@Query() analyticsCountDto: AnalyticsCountDto, @GetUser() user): Promise<SuccessInterface> {
    analyticsCountDto.interval = analyticsCountDto.interval ? analyticsCountDto.interval : 1;

    const response = await this.employerCompaniesService.getEmployerGrowth(analyticsCountDto, true);

    const fields = ['Joined On', 'New Users Registered'];
    return json2csv.parse(response.data, { fields });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Get unmudl admin access to employer portal.' })
  @Post('/unmudl-admin/access')
  @ApiConsumes('multipart/form-data')
  async UnmudlAdminEmployerPortalAccess(@Body() employerCompanyIdDto: EmployerCompanyIdDto, @GetUser() user) {
    if (user.type !== 'user' || user.collegeId) {
      return ResponseHandler.fail('Only Unmudl superadmin can access this route.');
    }

    return await this.employerCompaniesService.returnUnmudlAdminEmployerPortalAccess(employerCompanyIdDto.employerId, user);
  }
}
