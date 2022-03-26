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

@SocketController()
export class GameController {
  @OnMessage("game_progress_check")
  public async gamecheck(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { token: string; user_id: string }
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    const res: AxiosResponse = await myAxios.post("/getRoomData", {
      token: message.token,
    });
    console.log(
      `查询用户 ${message.user_id} 是否在游戏中 -socket_id: ${socket.id}`
    );
    console.log("------------------------------------------");
    if (res.data.code === "200") {
      const matchInfo = res.data.data;
      console.log(
        `用户 ${message.user_id} 正在游戏中 -socket_id: ${socket.id}`
      );
      console.log("------------------------------------------");
      socket.emit("game_status", { data: matchInfo, status: true });
    } else {
      if (res.data.data.login === 1) {
        console.log(`用户 ${message.user_id} 登录失效`);
        socket.emit("isLogin", { status: false });
        return;
      }
      console.log(
        `用户 ${message.user_id} 当前未进行游戏 -socket_id: ${socket.id}`
      );
      console.log("------------------------------------------");
      socket.emit("game_status", { status: false });
    }
  }

  @OnMessage("match_check")
  public async matchCheck(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { token: string }
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    try {
      const res: AxiosResponse = await myAxios.post("/getMatch", {
        token: message.token,
      });
      if (res.data.code === "200") {
        socket.emit("is_matching");
      } else {
        socket.emit("no_matching");
      }
    } catch (error) {
      socket.emit("no_matching");
    }
  }

  // User successfully Logined in
  // Match started, redis subscribe for room info
  @OnMessage("match_room")
  public async matchRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { user_id: string; token: string }
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    try {
      const res: AxiosResponse = await myAxios.post("/matching", {
        token: message.token,
        room_type: "pvp-auto",
      });
      if (res.data.code === "200") {
        console.log(`用户 ${message.user_id} 进入匹配队列成功`);
        socket.emit("match_success");
      } else {
        if (res.data.data.login === 1) {
          console.log(`用户 ${message.user_id} 登录失效`);
          socket.emit("isLogin", { status: false });
          return;
        }
        socket.emit("match_error");
        console.log(`用户 ${message.user_id} 进入匹配队列失败`);
      }
    } catch (error) {
      console.log(`用户 ${message.user_id} 进入匹配队列失败`);
      socket.emit("match_error");
    }
  }

  @OnMessage("quit_match")
  public async quitMatch(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: { user_id: string; token: string }
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    try {
      const res = await myAxios.post("/enforceQuit", {
        token: message.token,
        room_type: "pvp-auto",
      });
      if (res.data.code === "200") {
        console.log(`用户 ${message.user_id} 取消匹配成功`);
        socket.emit("quit_success");
      } else {
        if (res.data.data.login === 1) {
          console.log(`用户 ${message.user_id} 登录失效`);
          socket.emit("isLogin", { status: false });
          return;
        }
        console.log(`用户 ${message.user_id} 取消匹配失败`);
        socket.emit("quit_error");
      }
    } catch (error) {
      console.log(`用户 ${message.user_id} 取消匹配失败`);
      socket.emit("quit_error", error);
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
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    try {
      const res = await myAxios.post("/battle", {
        token: message.token,
        hash: message.button,
      });

      if (res.data.code === "200") {
        socket.emit("game_update_success", res.data);
        socket
          .to(res.data.data.room_id.toString())
          .emit("game_update_success", res.data);
      } else {
        if (res.data.data.login === 1) {
          console.log(`用户 ${message.user_id} 登录失效`);
          socket.emit("isLogin", { status: false });
          return;
        }
      }
    } catch (error) {
      console.error(error);
      socket.emit("game_update_error", "update game error");
    }
  }
}
