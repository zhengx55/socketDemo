import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
} from "socket-controllers";
import { Socket } from "socket.io";
@SocketController()
export class RoomController {
  @OnMessage("enter_room")
  public async joinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string
  ) {
    await socket.join(message);
    socket.emit("room_joined", { message: "Room entered successfully" });
    socket
      .to(message)
      .emit("room_joined", { message: "Your component has entered ..." });
  }
}
