import axios from "axios";
import {
  ConnectedSocket,
  EmitOnSuccess,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Socket, Server } from "socket.io";
import { setupInterceptorsTo } from "../Interceptors.ts";
import { createClient } from "redis";

@SocketController()
export class GameController {
  // 获取room信息
  private getSocketGameRoom(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (room) => room !== socket.id
    );
    const gameRoom = socketRooms && socketRooms[0];
    return gameRoom;
  }
  // 当用户成功登录后 开始请求匹配接口 并返回给前端
  @OnMessage("match_room")
  @EmitOnSuccess("match_successfully")
  public async matchRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {    
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: "https://dao.oin.finance/index/game",
        timeout: 5000,
      })
    );
    const res = await myAxios.post("/matching", {
      data: { coon_id: message.connection_id, user_id: message.user_id },
    });
    if (res.status === 200) {
      socket.emit("match_status");
    } else {
      socket.emit("match_error", res.status);
    }
  }

  @OnMessage("update_game")
  // 匹配成功后，双方进入游戏房间
  // 游戏开始后更新通信...
  public async updateGame(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit("on_game_update", message);
  }

  @OnMessage("game_win")
  public async gameWin(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit("on_game_win", message);
  }
}
