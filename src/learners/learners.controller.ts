import { JwtService } from '@nestjs/jwt';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { LearnersService } from './learners.service';
import { LearnerTokensService } from './learnerTokens.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards, UseInterceptors, UploadedFiles, Query, HttpCode, Delete } from '@nestjs/common';
import { diskStorage } from 'multer';
import { LEARNERS_IMG_PATH, PROFILE_PHOTO_THUMBNAIL_SIZE } from '../config/config';
import { ChangePasswordDto } from '../common/dto/changePassword.dto';
import { CreatePasswordDto } from './dto/createPassword.dto';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { CreateLearnerDto } from './dto/createLearner.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import responseMessages from '../config/responseMessages';
import { VerifyLearnerDto } from './dto/verifyLearner.dto';
import { SocialSignupTokenDto } from './dto/socialSignupToken.dto';
import { EditPersonalInformationDto } from './dto/editPersonalInformation.dto';
import { EditLocationInformationDto } from './dto/editLocationInformation.dto';
import { StripeService } from '../stripe/stripe.service';
import { GetUser } from '../auth/get-user.decorator';
import { StripeTokenDto } from '../common/dto/stripeToken.dto';
import { AuthGuard } from '@nestjs/passport';
import { CardIdDto } from '../common/dto/cardId.dto';
import { CourseIdsDto } from '../courses/dto/courseIds.dto';
import { UpdateProfilePhotoDto } from './dto/updateProfilePhoto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as fs from 'fs';
import { EmailPhoneDto } from './dto/email-phone.dto';
import emailHtml from '../common/emailHtml';
// tslint:disable-next-line:no-var-requires
const axios = require('axios');
// tslint:disable-next-line:no-var-requires
const sharp = require('sharp');
// tslint:disable-next-line:no-var-requires
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import * as moment from 'moment';
import { EmailDto } from '../common/dto/email.dto';
import { PhoneNumberDto } from '../common/dto/phoneNumber.dto';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { SourceTalentService } from '../source-talent/source-talent.service';
import { SourceTalentType } from '../source-talent/dto/createSourceTalent.dto';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
import { GetHelpAndSupportChatsDto } from './dto/getHelpAndSupportChats.dto';

@ApiTags('Learners (User Portal)')
@Controller('learners')
export class LearnersController {
  constructor(
    private readonly learnersService: LearnersService,
    private readonly learnerTokenService: LearnerTokensService,
    private readonly stripeService: StripeService,
    private readonly jwtService: JwtService,
    private readonly enquiriesService: EnquiriesService,
    private readonly sourceTalentService: SourceTalentService,
  ) {}

  @ApiOperation({ summary: 'Get email validated.' })
  @Get('email/validation')
  async GetEmailValidation(@Query() emailDto: EmailDto) {
    return await this.learnersService.validateEmail(emailDto);
  }

  @ApiOperation({ summary: 'Get phoneNumber validated.' })
  @Get('phone-number/validation')
  async GetPhoneNumberValidation(@Query() phoneNumberDto: PhoneNumberDto) {
    return await this.learnersService.validatePhoneNumber(phoneNumberDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Add learner payment method.' })
  @Post('payment-method')
  @HttpCode(200)
  async CreatePaymentMethod(@Body() stripeTokenDto: StripeTokenDto, @GetUser() user) {
    return await this.stripeService.addLearnerPaymentMethod(stripeTokenDto.stripeToken, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get learner cart.' })
  @Get('cart')
  async GetCart(@GetUser() user) {
    const courseIds = user.cart.map(cart => cart.course);
    return await this.learnersService.getLearnerCourses(courseIds, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Remove course from learner cart.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('remove/from-cart')
  async RemoveFromCart(@Body() courseIds: CourseIdsDto, @GetUser() learner) {
    return await this.learnersService.removeCoursesFromCart(courseIds.courses, learner._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Remove course from learner cart.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('remove/from-wishlist')
  async RemoveFromWishList(@Body() courseIds: CourseIdsDto, @GetUser() learner) {
    return await this.learnersService.removeCoursesFromWishList(courseIds.courses, learner._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get learner wishList.' })
  @Get('wishList')
  async GetWishList(@GetUser() user) {
    const courseIds = user.wishList.map(cart => cart.course);
    return await this.learnersService.getLearnerCourses(courseIds, user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get learner wishList.' })
  @Get('notifications')
  async GetNotifications(@Query() paginationDto: PaginationDto, @GetUser() user) {
    paginationDto.page = paginationDto.page ? Number(paginationDto.page) : 1;
    paginationDto.perPage = paginationDto.perPage ? Number(paginationDto.perPage) : 4;
    return await this.learnersService.getLearnerNotifications(paginationDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get learner wishList.' })
  @Get('help&support')
  async GetHelpAndSupport(@Query() getHelpAndSupportChatsDto: GetHelpAndSupportChatsDto, @GetUser() user) {
    const chats = await this.learnersService.getLearnerChats(user, getHelpAndSupportChatsDto);

    return ResponseHandler.success(chats.data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get learner enrollments.' })
  @Get('enrollments')
  async GetEnrollments(@GetUser() user) {
    return await this.learnersService.getLearnersEnrollments(user._id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get learner payment methods.' })
  @Get('payment-method')
  async GetPaymentMethods(@GetUser() user) {
    if (user.stripeCustomerId) {
      return await this.stripeService.getPaymentMethods(user.stripeCustomerId);
    } else {
      return ResponseHandler.success([]);
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete learner payment method.' })
  @Delete('payment-method')
  async DeletePaymentMethod(@Query() cardIdDto: CardIdDto, @GetUser() user) {
    if (user.stripeCustomerId) {
      return await this.stripeService.removeCustomerCard(user.stripeCustomerId, cardIdDto.cardId);
    } else {
      return ResponseHandler.fail(`You aren't registered with stripe.`);
    }
  }

  @ApiOperation({ summary: 'Learners Signup' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('create')
  @HttpCode(200)
  async CreateLearner(@Body() createLearnerDto: CreateLearnerDto): Promise<SuccessInterface> {
    if (createLearnerDto.emailAddress) {
      const existingLearner = await this.learnersService.getLearnerByEmail(createLearnerDto.emailAddress);
      if (existingLearner) {
        ResponseHandler.fail(responseMessages.common.emailRegistered);
      }
    } else {
      const existingLearner = await this.learnersService.getLearnerByPhoneNumber(createLearnerDto.phoneNumber);
      if (existingLearner) {
        ResponseHandler.fail(responseMessages.common.phoneNumberRegistered);
      }
    }
    const res = await this.learnersService.insertLearner(createLearnerDto);
    const learner = res.data;
    // console.log(process.env.MAILER_SECURE);

    const verification = await this.learnersService.sendVerificationLink(learner);

    if (verification) {
      return ResponseHandler.success(
        { learner },
        learner.emailAddress ? responseMessages.createLearner.emailSent : responseMessages.createLearner.messageSent,
      );
    } else {
      return ResponseHandler.fail(
        learner.emailAddress ? responseMessages.createLearner.emailError : responseMessages.createLearner.messageError,
      );
    }
  }

  @ApiOperation({ summary: 'Resend Signup verification code' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('resend/verification-code')
  @HttpCode(200)
  async ResendVerificationCode(@Body() emailDto: EmailPhoneDto) {
    const learner = emailDto.emailAddress
      ? await this.learnersService.getLearnerByEmail(emailDto.emailAddress)
      : await this.learnersService.getLearnerByPhoneNumber(emailDto.phoneNumber);
    if (!learner) {
      return ResponseHandler.fail('User does not exist');
    }

    const verification = await this.learnersService.sendVerificationLink(learner);

    if (verification) {
      return ResponseHandler.success({}, responseMessages.createLearner.emailSent);
    } else {
      return ResponseHandler.fail(responseMessages.createLearner.emailError);
    }
  }

  @ApiOperation({ summary: 'Learners Google Signup' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('/google/signup')
  @HttpCode(200)
  async SignInUsingGoogle(@Body() googleTokenDto: SocialSignupTokenDto) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: googleTokenDto.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      if (!ticket) {
        return ResponseHandler.fail(responseMessages.common.invalidToken);
      }
      const payload = ticket.getPayload();
      // return ResponseHandler.success(payload);
      // if (payload.picture) {
      //   const data = await axios.request({
      //     responseType: 'arraybuffer',
      //     url: payload.picture,
      //     method: 'get',
      //   });
      //   // console.log(data);
      // }
      // console.log(payload);
      let learner = await this.learnersService.getLearnerByEmail(payload.email);

      if (!learner) {
        learner = await this.learnersService.insertLearner({
          emailAddress: payload.email,
          firstname: payload.given_name,
          lastname: payload.family_name,
          profilePhoto: payload.picture,
          password: '',
          isVerified: true,
        });
        learner = learner.data;
      }
      learner.firstname = payload.given_name ? payload.given_name : learner.firstname;
      learner.lastname = payload.family_name ? payload.family_name : learner.lastname;
      // learner.profilePhoto = payload.picture ? payload.picture : learner.profilePhoto;
      learner.fullname = learner.firstname + ' ' + learner.lastname;
      learner.lastLoggedIn = new Date();

      const image = await axios.request({
        responseType: 'arraybuffer',
        url: payload.picture,
        method: 'get',
      });
      const photo = process.env.LEARNERS_IMG_PATH + learner._id + '.jpg';
      fs.writeFileSync('./public' + photo, image.data);

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        let files: any = {file: [{destination: LEARNERS_IMG_PATH, filename: `${learner._id}.jpg`}]};
        files.file[0].buffer = fs.readFileSync(`public${photo}`);
        moveFilesToS3(LEARNERS_IMG_PATH, files);
      }
      // console.log(process.env.LEARNERS_IMG_PATH + learner._id);
      learner.profilePhoto = photo;
      learner.profilePhotoThumbnail = photo;

      learner = await learner.save();
      // await this.learnersService.updateLastLoggedIn(learner._id);
      const tokenPayload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
      const accessToken = this.jwtService.sign(tokenPayload);
      return ResponseHandler.success({
        accessToken,
        learner: {
          _id: learner._id,
          firstname: learner.firstname,
          lastname: learner.lastname,
          fullname: learner.fullname,
          ethnicity: learner.ethnicity ? learner.ethnicity : null,
          profilePhoto: learner.profilePhoto,
          profilePhotoThumbnail: learner.profilePhotoThumbnail,
          emailAddress: learner.emailAddress,
          phoneNumber: learner.phoneNumber,
          address: learner.address,
          city: learner.city,
          state: learner.state,
          country: learner.country,
          zip: learner.zip,
          cartCoursesCount: learner.cart ? learner.cart.length : 0,
          coordinates: learner.coordinates,
          dateOfBirth: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : null,
          primarySignup: learner.primarySignup,
          createdAt: learner.createdAt,
          imageData: image.data,
        },
      });
    } catch (err) {
      return ResponseHandler.fail(err.message);
    }
  }

  @ApiOperation({ summary: 'Learners Facebook Signup' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('/linkedin/signup')
  @HttpCode(200)
  async SignInUsingLinkedin(@Body() socialSignupTokenDto: SocialSignupTokenDto) {
    try {
      const body = new URLSearchParams({
        grant_type: process.env.LINKEDIN_GRANT_TYPE,
        code: socialSignupTokenDto.token,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT,
        client_secret: process.env.LINKEDIN_SECRET,
      });
      // return ResponseHandler.fail(socialSignupTokenDto.token);

      const res = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', body);

      const userData = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });

      const emailData = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });
      // console.log(res);
      // https://stackoverflow.com/questions/46149484/linkedin-v2-api-not-enough-permissions-to-access-me-get?rq=1
      // return ResponseHandler.success({ data: userData.data, emailData: emailData.data });
      const email = emailData.data.elements[0]['handle~'].emailAddress;
      let learner = await this.learnersService.getLearnerByEmail(email);

      if (!learner) {
        learner = await this.learnersService.insertLearner({
          emailAddress: email,
          firstname: userData.data.localizedFirstName,
          lastname: userData.data.localizedLastName,
          // profilePhoto: payload.picture,
          password: '',
          isVerified: true,
        });
        learner = learner.data;
      }
      learner.firstname = userData.data.localizedFirstName ? userData.data.localizedFirstName : learner.firstname;
      learner.lastname = userData.data.localizedLastName ? userData.data.localizedLastName : learner.lastname;
      // learner.profilePhoto = payload.picture ? payload.picture : learner.profilePhoto;
      learner.fullname = learner.firstname + ' ' + learner.lastname;
      learner.lastLoggedIn = new Date();

      // const image = await axios.request({
      //   responseType: 'arraybuffer',
      //   url: payload.picture,
      //   method: 'get',
      // });
      // const photo = process.env.LEARNERS_IMG_PATH + learner._id + '.jpg';
      // fs.writeFileSync('./public' + photo, image.data);
      // // console.log(process.env.LEARNERS_IMG_PATH + learner._id);
      // learner.profilePhoto = photo;

      learner = await learner.save();
      // await this.learnersService.updateLastLoggedIn(learner._id);
      const tokenPayload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
      const accessToken = this.jwtService.sign(tokenPayload);
      return ResponseHandler.success({
        accessToken,
        learner: {
          _id: learner._id,
          firstname: learner.firstname,
          lastname: learner.lastname,
          fullname: learner.fullname,
          ethnicity: learner.ethnicity ? learner.ethnicity : null,
          profilePhoto: learner.profilePhoto,
          profilePhotoThumbnail: learner.profilePhotoThumbnail,
          emailAddress: learner.emailAddress,
          phoneNumber: learner.phoneNumber,
          address: learner.address,
          city: learner.city,
          state: learner.state,
          country: learner.country,
          zip: learner.zip,
          cartCoursesCount: learner.cart ? learner.cart.length : 0,
          coordinates: learner.coordinates,
          dateOfBirth: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : null,
          primarySignup: learner.primarySignup,
          createdAt: learner.createdAt,
        },
      });
    } catch (err) {
      return ResponseHandler.fail(err.response.data.message);
    }
  }

  @ApiOperation({ summary: 'Learners Facebook Signup' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('/facebook/signup')
  @HttpCode(200)
  async SignInUsingFacebook(@Body() socialSignupTokenDto: SocialSignupTokenDto) {
    try {
      const clientId = process.env.FACEBOOK_CLIENT_ID;
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
      let response = await axios.get(
        `https://graph.facebook.com/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=email`,
      );
      const appToken = response.data.access_token;

      response = await axios.get(
        `https://graph.facebook.com/debug_token?input_token=${socialSignupTokenDto.token}&access_token=${appToken}`,
      );
      const { app_id, is_valid, user_id } = response.data.data;

      if (app_id !== clientId) {
        ResponseHandler.fail(responseMessages.common.invalidClientId);
      }

      if (!is_valid) {
        ResponseHandler.fail(responseMessages.common.invalidToken);
      }

      response = await axios.get(
        `https://graph.facebook.com/v2.11/${user_id}?fields=id,first_name,last_name,picture,email&access_token=${socialSignupTokenDto.token}`,
      );

      const { picture, email, first_name, last_name } = response.data;
      let learner = await this.learnersService.getLearnerByEmail(email);
      // console.log(picture);
      if (!learner) {
        response = await this.learnersService.insertLearner({
          emailAddress: email,
          firstname: first_name,
          lastname: last_name,
          // profilePhoto: picture.data.url,
          password: '',
          isVerified: true,
        });
        learner = response.data;
      }
      learner.firstname = first_name ? first_name : learner.firstname;
      learner.lastname = last_name ? last_name : learner.lastname;
      // learner.profilePhoto = picture.data.url ? picture.data.url : learner.profilePhoto;
      learner.fullname = learner.firstname + ' ' + learner.lastname;
      learner.lastLoggedIn = new Date();

      // console.log(picture.data.url);
      if (picture.data.url) {
        const image = await axios.request({
          responseType: 'arraybuffer',
          url: picture.data.url,
          method: 'get',
        });
        const photo = process.env.LEARNERS_IMG_PATH + learner._id + '.jpg';
        fs.writeFileSync('./public' + photo, image.data);

        // S3 uploads
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
          let files: any = {file: [{destination: LEARNERS_IMG_PATH, filename: `${learner._id}.jpg`}]};
          files.file[0].buffer = fs.readFileSync(`public${photo}`);
          moveFilesToS3(LEARNERS_IMG_PATH, files);
        }
        // console.log(process.env.LEARNERS_IMG_PATH + learner._id);
        learner.profilePhoto = photo;
        learner.profilePhotoThumbnail = photo;
      } else {
        learner.profilePhoto = '';
      }

      learner = await learner.save();

      // await this.learnersService.updateLastLoggedIn(learner._id);
      const tokenPayload = { _id: learner._id, emailAddress: learner.emailAddress, type: 'learner' };
      const accessToken = this.jwtService.sign(tokenPayload);
      return ResponseHandler.success({
        accessToken,
        learner: {
          _id: learner._id,
          firstname: learner.firstname,
          lastname: learner.lastname,
          fullname: learner.fullname,
          ethnicity: learner.ethnicity ? learner.ethnicity : null,
          profilePhoto: learner.profilePhoto,
          profilePhotoThumbnail: learner.profilePhotoThumbnail,
          emailAddress: learner.emailAddress,
          phoneNumber: learner.phoneNumber,
          address: learner.address,
          city: learner.city,
          state: learner.state,
          country: learner.country,
          zip: learner.zip,
          cartCoursesCount: learner.cart ? learner.cart.length : 0,
          coordinates: learner.coordinates,
          dateOfBirth: learner.dateOfBirth ? moment(learner.dateOfBirth).format('MM-DD-YYYY') : null,
          primarySignup: learner.primarySignup,
          createdAt: learner.createdAt,
        },
      });
    } catch (err) {
      return ResponseHandler.fail(err.message);
    }
  }

  @ApiOperation({ summary: 'Learners Verification' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('verify')
  @HttpCode(200)
  async VerifyLearner(@Body() verifyLearnerDto: VerifyLearnerDto) {
    const learner = verifyLearnerDto.emailAddress
      ? await this.learnersService.getLearnerByEmail(verifyLearnerDto.emailAddress)
      : await this.learnersService.getLearnerByPhoneNumber(verifyLearnerDto.phoneNumber);
    if (!learner) {
      return ResponseHandler.fail('No user found.');
    }
    verifyLearnerDto.learnerId = learner ? learner._id : '';
    const token = await this.learnerTokenService.validateVerificationCode(verifyLearnerDto);
    if (!token) {
      ResponseHandler.fail(responseMessages.createLearner.invalidVerificationCode);
    } else {
      return await this.learnersService.verifyLearner(verifyLearnerDto.learnerId);
    }
  }

  @ApiOperation({ summary: 'Get password reset link.' })
  @Post('forgotPassword')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async sendPasswordResetLink(@Body() emailDto: EmailPhoneDto): Promise<SuccessInterface> {
    const learner = emailDto.emailAddress
      ? await this.learnersService.getLearnerByEmail(emailDto.emailAddress)
      : await this.learnersService.getLearnerByPhoneNumber(emailDto.phoneNumber);
    // console.log(response)
    if (learner) {
      if (emailDto.phoneNumber && learner.emailAddress) {
        delete learner.emailAddress;
      }
      const linkSent = await this.learnersService.sendResetPasswordLink(learner);
      if (linkSent) {
        return ResponseHandler.success({
          message: `Password reset link sent to your ${learner.emailAddress ? 'email address' : 'phone number'}`,
        });
      } else {
        return ResponseHandler.fail(`Unable to send ${learner.emailAddress ? 'email' : 'message'}`);
      }
    } else {
      return ResponseHandler.fail(emailDto.emailAddress ? 'Email not found.' : 'Phone number not found.');
    }
  }

  @ApiOperation({ summary: 'Reset user password.' })
  @Post('/reset/password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<SuccessInterface> {
    const token = await this.learnerTokenService.verifyCode(resetPasswordDto);

    if (token) {
      const updatePassword = await this.learnersService.updatePassword(resetPasswordDto.password, token.learnerId);

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
  @ApiOperation({ summary: 'Update learners personal information.' })
  @Post('update-profilePhoto')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public' + LEARNERS_IMG_PATH);
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  async UpdateProfilePhoto(@Body() updateProfilePhotoDto: UpdateProfilePhotoDto, @GetUser() learner, @UploadedFiles() files) {
    if (files && files.file) {
      // console.log(files.file[0].path)
      await sharp(files.file[0].path)
        .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
        .toFile(files.file[0].path.replace('.', '_t.'));
      updateProfilePhotoDto.profilePhotoThumbnail = (LEARNERS_IMG_PATH + files.file[0].filename).replace('.', '_t.');

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(LEARNERS_IMG_PATH, files);
        files.file[0].buffer = fs.readFileSync(files.file[0].path);
        files.profilePhotoThumbnail = [
          {
            ...files.file[0],
            buffer: await sharp(files.file[0].path)
              .resize(PROFILE_PHOTO_THUMBNAIL_SIZE)
              .toBuffer(),
            filename: files.file[0].filename.replace('.', '_t.'),
          },
        ];

        moveFilesToS3(LEARNERS_IMG_PATH, files);
      }
    }
    updateProfilePhotoDto.profilePhoto = files && files.file ? LEARNERS_IMG_PATH + files.file[0].filename : '';
    // console.log(files.profilePhoto[0].path.replace('.', '_t.'));
    // const resized = await sharp(files.profilePhoto[0].path).resize(PROFILE_PHOTO_THUMBNAIL_SIZE).toFile
    // (files.profilePhoto[0].path.replace('.', '_t.'));
    // console.log(resized);
    const update = await this.learnersService.updateLearner(updateProfilePhotoDto, learner._id);

    return update
      ? ResponseHandler.success({ profilePhoto: update.profilePhoto }, 'Profile photo updated successfully')
      : ResponseHandler.fail('Unable to update profile photo.');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update learners personal information.' })
  @Post('update-personalInformation')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt'))
  async UpdatePersonalInformation(@Body() editPersonalInformationDto: EditPersonalInformationDto, @GetUser() learner) {
    if (editPersonalInformationDto.emailAddress) {
      const existingLearner = await this.learnersService.getLearnerByEmail(editPersonalInformationDto.emailAddress);
      // @ts-ignore
      if (existingLearner && existingLearner._id.toString() !== learner._id.toString()) {
        return ResponseHandler.fail(responseMessages.common.emailRegistered);
      }
    }

    if (editPersonalInformationDto.phoneNumber) {
      const existingLearner = await this.learnersService.getLearnerByPhoneNumber(editPersonalInformationDto.phoneNumber);
      // @ts-ignore
      if (existingLearner && existingLearner._id.toString() !== learner._id.toString()) {
        return ResponseHandler.fail(responseMessages.common.phoneNumberRegistered);
      }
    }
    editPersonalInformationDto.emailAddress = editPersonalInformationDto.emailAddress ? editPersonalInformationDto.emailAddress : '';
    editPersonalInformationDto.phoneNumber = editPersonalInformationDto.phoneNumber ? editPersonalInformationDto.phoneNumber : '';
    editPersonalInformationDto.fullname = editPersonalInformationDto.firstname + ' ' + editPersonalInformationDto.lastname;

    const updatedLearner = await this.learnersService.updateLearner(editPersonalInformationDto, learner._id);
    return ResponseHandler.success({ updatedLearner });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update learners location information.' })
  @Post('location-information')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(AuthGuard('jwt'))
  async UpdateLocation(@Body() editLocationInformationDto: EditLocationInformationDto, @GetUser() learner) {
    const updatedLearner = await this.learnersService.updateLearner(editLocationInformationDto, learner._id);
    return ResponseHandler.success({ updatedLearner });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update learners password.' })
  @Post('update-password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(AuthGuard('jwt'))
  async UpdatePassword(@Body() changePasswordDto: ChangePasswordDto, @GetUser() learner) {
    return await this.learnersService.changePassword(changePasswordDto, learner._id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new password for socially logged users.' })
  @Post('create-password')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(AuthGuard('jwt'))
  async CreatePassword(@Body() createPasswordDto: CreatePasswordDto, @GetUser() learner) {
    return await this.learnersService.createPassword(createPasswordDto, learner._id);
  }

  @Get('testMailLog')
  async TestMailLog() {
    return await this.learnersService.testMailLog();
  }
}
