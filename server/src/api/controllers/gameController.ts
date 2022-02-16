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

  @OnMessage("update_game")
  // Matched success
  // room communciation
  public async updateGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: "https://dao.oin.finance/index/game",
        timeout: 5000,
      })
    );
    const res = await myAxios.post("/battle", {
      data: {
        conn_id: message.connection_id,
        room_id: message.room_id,
        user_id: message.user_id,
        battle_type: message.battle_type,
        command: message.command,
        number: "10",
        button: message.button,
      },
    });
    if (res.status === 200) {
      socket.emit("game_update", res.data);
    } else {
      socket.emit("game_updaate_error", { error: "some error occured" });
    }
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
}
