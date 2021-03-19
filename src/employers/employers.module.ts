import { Module } from '@nestjs/common';
import { EmployersController } from './employers.controller';
import { EmployersService } from './employers.service';
import { EmployerSchema } from './employer.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'employers', schema: EmployerSchema }]),
  ],
  controllers: [EmployersController],
  providers: [EmployersService],
  exports: [EmployersService],
})
export class EmployersModule {}
