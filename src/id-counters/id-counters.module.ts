import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterSchema } from './id-counter.model';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'id-counters', schema: CounterSchema}]),
  ],
})
export class IdCountersModule {}
