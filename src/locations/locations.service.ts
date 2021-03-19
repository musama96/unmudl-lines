import { Injectable, forwardRef, Inject, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { State } from './state.model';
// import { Country } from './country.model';
import * as mongoose from 'mongoose';
import responseMessages from '../config/responseMessages';

@Injectable()
export class LocationsService {
  constructor(@InjectModel('states') private readonly statesModel, @InjectModel('countries') private readonly countriesModel) {}

  async getStates(keyword) {
    return await this.statesModel.find().byName(keyword);
  }

  async getContries(keyword) {
    return await this.countriesModel.find().byName(keyword);
  }

  async createState(state) {
    return await this.statesModel.create(state);
  }

  async createCountry(country) {
    return await this.countriesModel.create(country);
  }
}
