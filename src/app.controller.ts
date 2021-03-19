import { Controller, Get, Request, Post, UseGuards, UseInterceptors, HttpCode, UploadedFiles, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { moveFilesToS3, setFilenameAndDestination } from './s3upload/s3';
import ResponseHandler, { SuccessInterface } from './common/ResponseHandler';
import { UploadImageDto } from './common/dto/uploadImage.dto';
const sharp = require('sharp');
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload images for TinyMCE.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './public/uploads/');
        },
        filename: (req, file, cb) => {
          let name = file.originalname.split('.');
          cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
        },
        // onError: err => {},
      }),
    }),
  )
  @Post('uploadImage')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  async UpdateUserDetails(@Body() uploadImageDto: UploadImageDto, @UploadedFiles() files) {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
      files = setFilenameAndDestination('uploads/', files);
      files.file[0].buffer = fs.readFileSync(files.file[0].path);
      moveFilesToS3('uploads/', files);
    }
    return files && files.file && files.file[0]
      ? { success: true, location: '/uploads/' + files.file[0].filename }
      : { success: false, location: null };
  }

  @Get('health-check')
  @HttpCode(200)
  async HealthCheckAPIs() {
    return ResponseHandler.success({}, 'Working fine');
  }
}
