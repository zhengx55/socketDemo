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
  @OnMessage("join_game")
  public async joinGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    console.log(`New User ${socket.id} joining room...:`, message);
    const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);

    // current socket room info
    // filter out the current rooms except for the default room
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    await socket.join(message.roomId);
    socket.emit("room_joined", { message: "Room entered successfully" });
    if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
      // console.log(io.sockets.adapter.rooms.get(message.roomId));
      socket.emit("start_game", { start: true, symbol: "x" });
      socket
        .to(message.roomId)
        .emit("start_game", { start: false, symbol: "o" });
    }
  }
}
