import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PromosService } from './promos.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUser } from '../auth/get-user.decorator';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { CreatePromoDto } from './dto/createPromo.dto';
import { PromoIdDto } from '../common/dto/promoId.dto';
import { UpdatePromoDto } from './dto/updatePromo.dto';
import { SuspendPromoDto } from './dto/suspendPromo.dto';
import { PromoListDto } from './dto/promoList.dto';
import { ApplyTo, DiscountCut } from '../common/enums/createPromo.enum';
import responseMessages from '../config/responseMessages';

@ApiTags('Promos')
@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of promos.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get()
  async GetPromos(@Query() promoListDto: PromoListDto, @GetUser() user): Promise<SuccessInterface> {
    promoListDto.keyword = promoListDto.keyword ? promoListDto.keyword : '';
    promoListDto.courseKeyword = promoListDto.courseKeyword ? promoListDto.courseKeyword : '';
    promoListDto.minDiscount = promoListDto.minDiscount || promoListDto.minDiscount === 0 ? promoListDto.minDiscount : null;
    promoListDto.maxDiscount = promoListDto.maxDiscount || promoListDto.maxDiscount === 0 ? promoListDto.maxDiscount : null;
    promoListDto.noOfUses = promoListDto.noOfUses || promoListDto.noOfUses === 0 ? promoListDto.noOfUses : null;
    promoListDto.page = promoListDto.page ? Number(promoListDto.page) : 1;
    promoListDto.perPage = promoListDto.perPage ? Number(promoListDto.perPage) : 10;
    promoListDto.sortOrder = promoListDto.sortOrder === 'asc' ? '1' : '-1';
    promoListDto.collegeId = user.collegeId ? user.collegeId : promoListDto.collegeId;

    return await this.promosService.getPromos(promoListDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of promos.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get('csv')
  @Header('Content-type', 'text/csv')
  @Header('Content-disposition', 'attachment; filename=promos.csv')
  async GetPromosCsv(@Query() promoListDto: PromoListDto, @GetUser() user): Promise<SuccessInterface> {
    promoListDto.keyword = promoListDto.keyword ? promoListDto.keyword : '';
    promoListDto.courseKeyword = promoListDto.courseKeyword ? promoListDto.courseKeyword : '';
    promoListDto.minDiscount = promoListDto.minDiscount || promoListDto.minDiscount === 0 ? promoListDto.minDiscount : null;
    promoListDto.maxDiscount = promoListDto.maxDiscount || promoListDto.maxDiscount === 0 ? promoListDto.maxDiscount : null;
    promoListDto.noOfUses = promoListDto.noOfUses || promoListDto.noOfUses === 0 ? promoListDto.noOfUses : null;
    promoListDto.sortOrder = promoListDto.sortOrder === 'asc' ? '1' : '-1';
    promoListDto.collegeId = user.collegeId ? user.collegeId : promoListDto.collegeId;

    return await this.promosService.getPromosCsv(promoListDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of promos.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get('admin-home')
  async GetCompletePromosSectionData(@Query() promoListDto: PromoListDto, @GetUser() user): Promise<SuccessInterface> {
    promoListDto.keyword = promoListDto.keyword ? promoListDto.keyword : '';
    promoListDto.collegeId = user.collegeId ? user.collegeId : promoListDto.collegeId;
    promoListDto.courseKeyword = promoListDto.courseKeyword ? promoListDto.courseKeyword : '';
    promoListDto.minDiscount = promoListDto.minDiscount || promoListDto.minDiscount === 0 ? promoListDto.minDiscount : null;
    promoListDto.maxDiscount = promoListDto.maxDiscount || promoListDto.maxDiscount === 0 ? promoListDto.maxDiscount : null;
    promoListDto.noOfUses = promoListDto.noOfUses || promoListDto.noOfUses === 0 ? promoListDto.noOfUses : null;
    promoListDto.page = promoListDto.page ? Number(promoListDto.page) : 1;
    promoListDto.perPage = promoListDto.perPage ? Number(promoListDto.perPage) : 10;
    promoListDto.sortOrder = promoListDto.sortOrder === 'asc' ? '1' : '-1';

    const promosResponse = await this.promosService.getPromos(promoListDto);

    return ResponseHandler.success({
      promos: promosResponse.data,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a promo.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async CreatePromo(@Body() createPromoDto: CreatePromoDto, @GetUser() user): Promise<SuccessInterface> {
    createPromoDto.type = user.collegeId
      ? DiscountCut.BOTH
      : createPromoDto.type === DiscountCut.BOTH
      ? DiscountCut.BOTH
      : DiscountCut.UNMUDL;
    createPromoDto.addedBy = user._id;
    createPromoDto.status = 'active';
    createPromoDto.collegeId = user.collegeId
      ? user.collegeId
      : createPromoDto.applyTo === ApplyTo.SELECTED
      ? createPromoDto.collegeId
      : null;

    if (createPromoDto.applyTo.toLowerCase() === 'all') {
      createPromoDto.courses = [];
    } else if (createPromoDto.applyTo === ApplyTo.SELECTED && createPromoDto.courses && createPromoDto.courses.length === 0) {
      return ResponseHandler.fail(responseMessages.createPromo.coursesRequired);
    }

    return await this.promosService.createPromo(createPromoDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promo details.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Post('update')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdatePromo(@Body() updatePromoDto: UpdatePromoDto, @GetUser() user): Promise<SuccessInterface> {
    updatePromoDto.type = user.collegeId
      ? DiscountCut.BOTH
      : updatePromoDto.type === DiscountCut.BOTH
      ? DiscountCut.BOTH
      : DiscountCut.UNMUDL;
    updatePromoDto.addedBy = user._id;
    updatePromoDto.applyTo = user.collegeId ? ApplyTo.SELECTED : updatePromoDto.applyTo;
    updatePromoDto.collegeId = user.collegeId ? user.collegeId : updatePromoDto.collegeId;

    if (updatePromoDto.applyTo.toLowerCase() === 'all') {
      updatePromoDto.courses = [];
    }

    return await this.promosService.updatePromo(updatePromoDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promo suspended status.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Post('update-suspended')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async UpdateSuspendedStatus(@Body() suspendPromoDto: SuspendPromoDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.promosService.updateSuspendedStatus(suspendPromoDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a promo.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Delete(':promoId')
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async DeletePromo(@Param() promoIdDto: PromoIdDto): Promise<SuccessInterface> {
    const promo = await this.promosService.getPromoById(promoIdDto.promoId);
    if (promo) {
      return await this.promosService.deletePromo(promoIdDto.promoId);
    } else {
      return ResponseHandler.fail(responseMessages.deletePromo.notFound);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo details.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get('/details/:promoId')
  async GetPromoDetails(@Param() promoIdDto: PromoIdDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.promosService.getPromoDetails(promoIdDto.promoId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promo transaction history.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @Get('/history/:promoId')
  async GetPromoHistory(@Param() promoIdDto: PromoIdDto, @GetUser() user): Promise<SuccessInterface> {
    return await this.promosService.getPromoHistory(promoIdDto.promoId);
  }
}
