import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service';
import { GetUser } from '../auth/get-user.decorator';
import { GetEnquiryMessagesDto } from './dto/getEnquiryMessages.dto';
import { AddLearnerEnquiryDto } from './dto/AddLearnerEnquiry.dto';
import ResponseHandler from '../common/ResponseHandler';

@ApiTags('Learner Enquiries')
@Controller('learner/enquiries')
export class LearnerEnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiries.' })
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async GetEnquiries(@GetUser() learner) {
    if (learner.type !== 'learner') {
      return ResponseHandler.fail('Only learners allowed.');
    }
    return await this.enquiriesService.getLearnerEnquiries(learner);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiries.' })
  @Get('messages')
  @UseGuards(AuthGuard('jwt'))
  async GetEnquiryMessages(@Query() getEnquiryMessagesDto: GetEnquiryMessagesDto, @GetUser() learner) {
    if (learner.type !== 'learner') {
      return ResponseHandler.fail('Only learners allowed.');
    }

    getEnquiryMessagesDto.page = getEnquiryMessagesDto.page ? Number(getEnquiryMessagesDto.page) : 1;
    getEnquiryMessagesDto.perPage = getEnquiryMessagesDto.perPage ? Number(getEnquiryMessagesDto.perPage) : 8;
    getEnquiryMessagesDto.learnerId = learner._id;
    getEnquiryMessagesDto.isAdmin = false;

    return await this.enquiriesService.getEnquiryMessages(getEnquiryMessagesDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiries.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async AddEnquiryMessage(@Body() addLearnerEnquiryDto: AddLearnerEnquiryDto, @GetUser() learner) {
    if (learner.type !== 'learner') {
      return ResponseHandler.fail('Only learners allowed.');
    }

    addLearnerEnquiryDto.learner = learner._id;

    return await this.enquiriesService.addLearnerEnquiryMessage(addLearnerEnquiryDto);
  }
}
