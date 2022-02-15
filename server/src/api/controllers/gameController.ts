import axios from "axios";
import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Socket, Server } from "socket.io";
import { client } from "../../server";
import { setupInterceptorsTo } from "../Interceptors.ts";

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

  // User successfully Logined in
  // Match started, redis subscribe for room info
  @OnMessage("match_room")
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
    const res: any = await myAxios.post("/matching", {
      data: { coon_id: message.connection_id, user_id: message.user_id },
    });
    if (res.data.code === "200") {
      client.subscribe("some-key", (msg: any) => {
        socket.emit("match_info", JSON.parse(msg));
      });
    } else {
      client.subscribe("some-key", (msg: any) => {
        socket.emit("match_info", JSON.parse(msg));
      });
      // socket.emit("match_error", { error: res.data.msg });
    }
  }

  @OnMessage("update_game")
  // 匹配成功后，双方进入游戏房间
  // 游戏开始后更新通信...
  public async updateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit("on_game_update", message);
  }

  @OnMessage("game_win")
  public async gameWin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit("on_game_win", message);
  }

  @OnMessage("game_lost")
  public async gameLost(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit("on_game_lost", message);
  }
}
