import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';

@Injectable()
export class WhiteLabelBannersService {

  constructor(
    @InjectModel('white-label-banners') private readonly whiteLabelBannerModel,
  ) {}

  async getWhiteLabelBanner(identifier: string) {
    const banner = await this.whiteLabelBannerModel.findOne({identifier, live: true}).lean().exec();

    return banner ? ResponseHandler.success(banner) : ResponseHandler.fail('Invalid Identifier');
  }
}
