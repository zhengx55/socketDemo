import axios, { AxiosResponse } from "axios";
import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Socket, Server } from "socket.io";
import { setupInterceptorsTo } from "../Interceptors.ts";
import { getRoom } from "../../utils/room";

@SocketController()
export class GameController {
  @OnMessage("game_progress_check")
  public async gamecheck(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: "https://dao.oin.finance/index/game",
        timeout: 5000,
      })
    );

    const res: AxiosResponse = await myAxios.post("/getRoomData", {
      data: {
        token: message.token,
      },
    });
    if (res.data.code === "200") {
      const matchInfo = res.data.data;
      socket.emit("game_status", { data: matchInfo, status: true });
    } else {
      socket.emit("game_status", { status: false });
    }
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
    try {
      const res: AxiosResponse = await myAxios.post("/matching", {
        data: {
          token: message.token,
          room_type: "pvp-auto",
        },
      });
      if (res.data.code === "200") {
        const roomInfo = getRoom(message.user_id);
        if (roomInfo) {
          socket.emit("match_info", { data: roomInfo, status: "success" });
        }
      } else if (res.data.code === "400") {
        try {
          const res: AxiosResponse = await myAxios.post("/getRoomData", {
            data: {
              token: message.token,
            },
          });
          if (res.data.code === "200") {
            const matchInfo = res.data.data;
            socket.emit("match_info", { data: matchInfo, status: "success" });
          }
        } catch (error) {
          console.log("get room data error", error);
        }
      }
    } catch (error) {
      console.error("Match Room", error);
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
        status: "success",
      });
      socket.to(message.roomId).emit("start_game", {
        status: "success",
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
    try {
      const res = await myAxios.post("/battle", {
        data: {
          token: message.token,
          room_type: message.battle_type,
          command: message.command,
          hash: message.button,
        },
      });
      if (res.status === 200) {
        socket.emit("game_update_success", res.data);
        socket.to(message.room_id).emit("game_update_success", res.data);
        if (message.command === "attack") {
          socket.emit("texture_update", { user_id: message.user_id });
          socket
            .to(message.room_id)
            .emit("texture_update", { user_id: message.user_id });
        }
      }
    } catch (error) {
      console.error(error);
      socket.emit("game_update_error", "update game error");
    }
  }
}
