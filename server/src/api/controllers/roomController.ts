import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
  SocketRooms,
} from "socket-controllers";
import { Socket, Server } from "socket.io";
@SocketController()
export class RoomController {
  @OnMessage("enter_room")
  public async joinGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    console.log(`New User ${socket.id} joining room...:`, message);
    await socket.join(message.roomId);
    socket.emit("room_joined", { message: "Room entered successfully" });
    if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
      socket.emit("start_game", { start: true, symbol: "x" });
      socket
        .to(message.roomId)
        .emit("start_game", { start: false, symbol: "o" });
    }
  }
}
