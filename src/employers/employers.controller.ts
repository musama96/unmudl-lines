import { Controller, Body, UseGuards, Post, UseInterceptors, UploadedFiles, Get, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { EmployersService } from './employers.service';
import { AddEmployerDto } from './dto/addEmployers.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { EMPLOYERS_LOGOS_PATH } from '../config/config';
import { KeywordDto } from '../common/dto/keyword.dto';
import { setFilenameAndDestination, moveFilesToS3 } from '../s3upload/s3';
const sharp = require('sharp');
import * as fs from 'fs';

@ApiTags('Employers')
@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a course' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager', 'moderator')
  @Post('create')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'employersLogos' }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/uploads/employers-logos/');
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  async AddEmployers(@Body() addEmployerDto: AddEmployerDto, @UploadedFiles() files): Promise<SuccessInterface> {
    if (files && files.employersLogos) {
      files.employersLogos.forEach((logo, index) => {
        // @ts-ignore
        addEmployerDto.employers[index].logo = EMPLOYERS_LOGOS_PATH + logo.filename;
      });

      // S3 uploads
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
        files = setFilenameAndDestination(EMPLOYERS_LOGOS_PATH, files);
        // files.headerImage[0].buffer = fs.readFileSync(files.headerImage[0].path);
        await Promise.all(files.employersLogos.map( async attachment => {
          attachment.buffer = fs.readFileSync(attachment.path);
          return null;
        }));
        
        moveFilesToS3(EMPLOYERS_LOGOS_PATH, files);
      }
    }

    // @ts-ignore
    const employers = await this.employersService.createEmployers(addEmployerDto.employers);

    return ResponseHandler.success({
      employers,
    });
  }

  @ApiOperation({ summary: 'Get a list of available employers.' })
  @Get()
  async GetEmployers(@Query() keywordDto: KeywordDto) {
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';

    const employers = await this.employersService.getEmployers(keywordDto.keyword);
    return ResponseHandler.success(employers);
  }

  @ApiOperation({ summary: 'Get a list of available employers.' })
  @Get('list')
  async GetEmployersForFilter(@Query() keywordDto: KeywordDto) {
    keywordDto.keyword = keywordDto.keyword ? keywordDto.keyword : '';
    keywordDto.collegeId = keywordDto.collegeId ? keywordDto.collegeId : null;

    const employers = await this.employersService.getEmployersForFilter(keywordDto);
    return ResponseHandler.success(employers);
  }
}
