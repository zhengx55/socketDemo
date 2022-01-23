import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
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
    console.log("New User joining room:", message);

    const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);

    // current socket room info
    // filter out the current rooms except for the default room
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    // limit connection numbers under 2 for a room
    if (
      socketRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    ) {
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play!",
      });
    } else {
      await socket.join(message.roomId);
      socket.emit("room_joined");
    }
    if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
      socket.emit("start_game", { start: true, symbol: "x" });
      socket
        .to(message.roomId)
        .emit("start_game", { start: false, symbol: "o" });
    }
  }
}
