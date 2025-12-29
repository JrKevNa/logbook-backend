// events.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' }, // Allow your Swift app or frontend
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    sendUpdate(event: string, payload: any) {
        this.server.emit(event, payload); // Broadcast to all connected clients
    }
}