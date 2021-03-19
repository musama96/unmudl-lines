import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import ResponseHandler from '../common/ResponseHandler';
import { CreateEmployerSubscriptionPromoDto } from './dto/createEmployerSubscription.dto';
import { VerifyEmployerSubscriptionPromoDto } from './dto/verifyPromo.dto';
import { EmployerSubscriptionPromosService } from './employer-subscription-promos.service';

@ApiTags('Employer Subscription Promos - Admin Portal')
@Controller('employer-subscription-promos')
export class EmployerSubscriptionPromosController {
  constructor(private readonly employerSubscriptionPromosService: EmployerSubscriptionPromosService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Create new employer subscription promo.' })
  async createEmployerSubscriptionPromo(@Body() createEmployerSubscriptionPromoDto: CreateEmployerSubscriptionPromoDto, @GetUser() user) {
    if (user.employerId || user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    createEmployerSubscriptionPromoDto.addedBy = user._id;
    createEmployerSubscriptionPromoDto.stripeTitle = createEmployerSubscriptionPromoDto.title + '-' + Date.now();
    createEmployerSubscriptionPromoDto.status = 'active';
    return await this.employerSubscriptionPromosService.createEmployerSubscriptionPromo(createEmployerSubscriptionPromoDto);
  }

  @Post('verify-promo')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'Verify if a promo can be applied.' })
  async verifyPromo(@Body() verifyEmployerSubscriptionPromoDto: VerifyEmployerSubscriptionPromoDto, @GetUser() user) {
    if (user.collegeId) {
      return ResponseHandler.fail('Unauthorized', null, 401);
    }

    return await this.employerSubscriptionPromosService.verifyPromo(verifyEmployerSubscriptionPromoDto);
  }
}
