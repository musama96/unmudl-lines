import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import { CreateLogDto } from './dto/createLog.dto';

@Injectable()
export class UnmudlAccessLogsService {
  constructor(@InjectModel('unmudl-access-logs') private readonly unmudlAccessLogModel) {}

  async createLog(log: CreateLogDto) {
    const newLog = await this.unmudlAccessLogModel.create(log);

    return ResponseHandler.success(newLog);
  }
}
