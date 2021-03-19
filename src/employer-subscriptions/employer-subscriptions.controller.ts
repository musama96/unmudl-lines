import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { EmployerSubscriptionsService } from './employer-subscriptions.service';
import ResponseHandler from '../common/ResponseHandler';
import { UpdateEmployerSubscriptionDto } from './dto/updateEmployerSubscription.dto';
import { UpdateCollegeOrStateDto } from './dto/updateCollegeOrState.dto';

@ApiTags('Employer Subscriptions')
@Controller('employer-subscriptions')
export class EmployerSubscriptionsController {
  constructor(private readonly employerSubscriptionsService: EmployerSubscriptionsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Subscribe to employer subscription plan.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateEmployerSubscription(@Body() createEmployerSubscriptionDto: UpdateEmployerSubscriptionDto, @GetUser() user) {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized');
    }

    createEmployerSubscriptionDto.stripeCustomerId = user.stripeCustomerId;
    createEmployerSubscriptionDto.employer = user.employerId;
    return await this.employerSubscriptionsService.updateEmployerSubscription(createEmployerSubscriptionDto);
  }

  @Post('update-college-state')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update college or state in subscription.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async updateCollegeOrState(@Body() updateCollegeOrStateDto: UpdateCollegeOrStateDto, @GetUser() user) {
    if (!user.employerId) {
      return ResponseHandler.fail('Unauthorized');
    }

    return await this.employerSubscriptionsService.updateCollegeOrState(updateCollegeOrStateDto);
  }

  @Post('init-subscriptions')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: `Subscribe to local plan if employer isn't subscribed to any.` })
  @ApiConsumes('application/x-www-form-urlencoded')
  async initializeEmployerSubscriptionsIfDoesntExist(@GetUser() user) {
    if (user.employerId || user.collegeId) {
      return ResponseHandler.fail('Unauthorized');
    }

    return await this.employerSubscriptionsService.initializeEmployerSubscriptionsIfDoesntExist();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans.' })
  async getEmployerSubscriptionPlans(@GetUser() user) {
    return await this.employerSubscriptionsService.getEmployerSubscriptionPlans(user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @Get('invoices')
  @ApiOperation({ summary: 'Get employer invoices.' })
  async getEmployerInvoices(@GetUser() user) {
    return await this.employerSubscriptionsService.getEmployerInvoices(user);
  }

  @Post('/plans/init-all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('superadmin')
  @ApiOperation({ summary: 'Initialize default employer subscription plans.' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async initializeDefaultSubscriptionPlans(@GetUser() user) {
    if (user.collegeId || user.employerId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    return await this.employerSubscriptionsService.initializeDefaultSubscriptionPlans();
  }
}
