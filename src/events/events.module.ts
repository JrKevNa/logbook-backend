import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
    providers: [EventsGateway],
    exports: [EventsGateway], // 👈 important: export so others can use it
})
export class EventsModule {}