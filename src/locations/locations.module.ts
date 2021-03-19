import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StateSchema } from './state.model';
import { CountrySchema } from './country.model';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'states', schema: StateSchema}]),
        MongooseModule.forFeature([{name: 'countries', schema: CountrySchema}]),
     ],
    controllers: [LocationsController],
    providers: [LocationsService],
    exports: [LocationsService],
})
export class LocationsModule {}
