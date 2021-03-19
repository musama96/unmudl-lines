import { Module } from '@nestjs/common';
import { WhiteLabelBannersController } from './white-label-banners.controller';
import { WhiteLabelBannersService } from './white-label-banners.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WhiteLabelBannerSchema } from './white-label-banner.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'white-label-banners', schema: WhiteLabelBannerSchema }])],
  controllers: [WhiteLabelBannersController],
  providers: [WhiteLabelBannersService]
})
export class WhiteLabelBannersModule {}
