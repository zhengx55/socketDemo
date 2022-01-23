import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
  SocketIO,
} from "socket-controllers";

import { Socket, Server } from "socket.io";

@SocketController()
export class MessageController {
  @OnConnect()
  public onConnection(
    @ConnectedSocket() socket: Socket,
    @SocketIO() io: Server
  ) {
    console.log("Socket connected:", socket.id);
    // listening for incoming event
    socket.on("custom_event", (data: any) => {
      console.log("Client Data:", data);
    });
  }
}
