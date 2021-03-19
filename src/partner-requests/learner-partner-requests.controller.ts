import {Body, Controller, HttpCode, Post} from '@nestjs/common';
import {ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger';
import {PartnerRequestDto} from './dto/partnerRequest.dto';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import {PartnerRequestsService} from './partner-requests.service';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Partner Requests (User Portal)')
@Controller('partner-requests')
export class LearnerPartnerRequestsController {
  constructor(private readonly partnerRequestsService: PartnerRequestsService) {}

  @ApiOperation({ summary: 'Add a become a partner request.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post('request')
  @HttpCode(200)
  async CreatePartnerRequest(@Body() collegeRequestDto: PartnerRequestDto) {

    const checkExisting = await this.partnerRequestsService.checkPartnerRequest(collegeRequestDto.collegeName);

    if (checkExisting) {
      return ResponseHandler.fail(responseMessages.collegeRequest.alreadyPending);
    } else {
      // @ts-ignore
      collegeRequestDto.status = 'pending';
      return await this.partnerRequestsService.createPartnerRequest(collegeRequestDto);
    }
  }
}
