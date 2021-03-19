import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactCollegeCategoryDto } from './dto/create-contact-college-category.dto';
import { ContactCollegeCategoriesService } from './contact-college-categories.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ListDto } from '../common/dto/list.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { ContactCollegeCategoryIdDto } from '../common/dto/contactCollegeCategoryId.dto';

@ApiTags('Contact College Categories')
@Controller('contact-college-categories')
export class ContactCollegeCategoriesController {
  constructor(private readonly contactCollegeCategoriesService: ContactCollegeCategoriesService) {}

  @ApiOperation({ summary: 'Create new contact college category' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  @HttpCode(200)
  @ApiConsumes('application/x-www-form-urlencoded')
  async createCategory(@Body() createContactCollegeCategoryDto: CreateContactCollegeCategoryDto) {
    createContactCollegeCategoryDto.subcategories =
      createContactCollegeCategoryDto.subcategories && createContactCollegeCategoryDto.subcategories.length > 0
        ? createContactCollegeCategoryDto.subcategories.map(subcategory => ({
            title: subcategory.title ? subcategory.title : subcategory,
          }))
        : [];
    return await this.contactCollegeCategoriesService.createCategory(createContactCollegeCategoryDto);
  }

  @ApiOperation({ summary: 'Get sorted and paginated list of categories' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  async getCategories(@Query() listDto: ListDto) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.page = listDto.page ? Number(listDto.page) : 1;
    listDto.perPage = listDto.perPage ? Number(listDto.perPage) : 10;
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    return await this.contactCollegeCategoriesService.getCategories(listDto);
  }

  @ApiOperation({ summary: 'Get sorted list of all categories' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllCategories(@Query() listDto: GetAllCategoriesDto) {
    listDto.keyword = listDto.keyword ? listDto.keyword : '';
    listDto.sortOrder = listDto.sortOrder === 'asc' ? '1' : '-1';
    listDto.sortBy = listDto.sortBy ? listDto.sortBy : 'createdAt';

    return await this.contactCollegeCategoriesService.getAllCategories(listDto);
  }

  @ApiOperation({ summary: 'Disable a category.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async disableCategory(@Param() categoryIdDto: ContactCollegeCategoryIdDto) {
    return await this.contactCollegeCategoriesService.disableCategory(categoryIdDto.id);
  }

  @ApiOperation({ summary: 'Enable a category.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('/enable/:id')
  async enableCategory(@Param() categoryIdDto: ContactCollegeCategoryIdDto) {
    return await this.contactCollegeCategoriesService.enableCategory(categoryIdDto.id);
  }
}
