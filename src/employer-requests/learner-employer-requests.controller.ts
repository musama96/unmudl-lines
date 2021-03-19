import {Body, Controller, HttpCode, Post} from '@nestjs/common';
import {ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import { GetUser } from '../auth/get-user.decorator';
import { EmployerRequestsService } from './employer-requests.service';
import { EmployerRequestDto } from './dto/employerRequest.dto';

@ApiTags('Employer Partner Requests (User Portal)')
@Controller('employer-requests')
export class LearnerEmployerRequestsController {
  constructor(private readonly employerRequestsService: EmployerRequestsService) {}

  @ApiOperation({ summary: 'Add a become a employer partner request.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('request')
  @HttpCode(200)
  async CreateEmployerRequest(@Body() employerRequestDto: EmployerRequestDto) {

    const checkExisting = await this.employerRequestsService.checkEmployerRequest(employerRequestDto.employerName);

    if (checkExisting) {
      return ResponseHandler.fail(responseMessages.collegeRequest.alreadyPending);
    } else {
      // @ts-ignore
      employerRequestDto.status = 'pending';
      return await this.employerRequestsService.createEmployerRequest(employerRequestDto);
    }
  }
}
