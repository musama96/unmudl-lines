import { Module } from '@nestjs/common';
import { ContactCollegeCategoriesController } from './contact-college-categories.controller';
import { ContactCollegeCategoriesService } from './contact-college-categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactCollegeCategorySchema } from './contact-college-category.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'contact-college-categories', schema: ContactCollegeCategorySchema }])],
  controllers: [ContactCollegeCategoriesController],
  providers: [ContactCollegeCategoriesService],
  exports: [ContactCollegeCategoriesService],
})
export class ContactCollegeCategoriesModule {}
