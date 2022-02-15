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
  @OnMessage("enter_room")
  public async joinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
    @SocketIO() io: Server
  ) {
    await socket.join(message);
    socket.emit("room_joined", { message: "Room entered successfully" });
    socket
      .to(message)
      .emit("room_joined", { message: "Your component has entered ..." });
  }

  @OnMessage("game_start")
  public async startGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { roomId: string }
  ) {
    if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
      socket.emit("start_game", {
        start: true,
        role: "attacker",
        command: [1, 3, 45, 21, 2, 3],
      });
      socket.to(message.roomId).emit("start_game", {
        start: false,
        room: "defender",
        command: [4, 2, 13, 21, 31, 2],
      });
    } else if (io.sockets.adapter.rooms.get(message.roomId).size < 2) {
      socket.emit("pendings_game", { msg: "waiting for you component..." });
    }
  }
}
