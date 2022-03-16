import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
} from "socket-controllers";
import axios from "axios";
import { Socket } from "socket.io";
import { setupInterceptorsTo } from "../Interceptors.ts";
import {
  addUser,
  getUser,
  getUserbyUserid,
  removeUser,
} from "../../utils/user";

@SocketController()
export class MessageController {
  @OnConnect()
  public onConnection(@ConnectedSocket() socket: Socket) {
    // console.log("Socket connected:", socket.id);
  }

  @OnMessage("account_validate")
  public async Validation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { user_id: string; token: string }
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    try {
      console.log(`检查用户 ${data.user_id} 账号是否可用`);
      console.log("------------------------------------------");
      const res = await myAxios.post("/isLogin", {
        token: data.token,
      });
      if (res.data.code === "200") {
        console.log(`用户 ${data.user_id} 账号可用`);
        console.log("------------------------------------------");
        socket.emit("validation_success");
      } else {
        console.log(`用户 ${data.user_id} 账号不可用`);
        console.log("------------------------------------------");
        socket.emit("validation_fail");
      }
    } catch (error) {
      console.log(`用户 ${data.user_id} 账号不可用`);
      console.log("------------------------------------------");
      socket.emit("validation_fail");
    }
  }

  @OnMessage("update_user")
  public updateUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { user_id: string; token: string }
  ) {
    addUser({
      socket_id: socket.id,
      user_id: Number(data.user_id),
      token: data.token,
    });
  }

  @OnMessage("request_login")
  public async Login(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    try {
      const res = await myAxios.post("/login", {
        coon_id: data.connection_id,
        user_id: data.user_id,
        address: data.user_address,
      });
      if (res.data.code === "200") {
        addUser({
          socket_id: socket.id,
          user_id: Number(res.data.data.user_id),
          token: res.data.data.token,
        });
        socket.emit("login_status", {
          status: "success",
          token: res.data.data.token,
          userId: res.data.data.user_id,
        });
      }
    } catch (error) {
      socket.emit("login_status", {
        status: "network error occured",
      });
    }
  }

  @OnDisconnect()
  public onDisconnection(@ConnectedSocket() socket: Socket) {
    const myAxios = setupInterceptorsTo(
      axios.create({
        baseURL: process.env.BASE_URL,
        timeout: 5000,
      })
    );
    const removed_user = getUser(socket.id);
    removeUser(socket.id);
    if (removed_user) {
      console.log(`检查玩家 ${removed_user.user_id} 是否重连...`);
      setTimeout(async () => {
        console.log("------------------------------------------");
        const check = getUserbyUserid(removed_user.user_id);
        if (check === undefined) {
          console.log(` 玩家 ${removed_user.user_id} 30秒内无应答.`);
          console.log("------------------------------------------");
          const res = await myAxios.post("/enforceQuit", {
            token: removed_user.token,
            room_type: "pvp-auto",
          });
          if (res.data.code === "200") {
            console.log(`强制退出玩家 ${removed_user.user_id} 成功`);
            console.log("------------------------------------------");
            socket
              .to(res.data.data.room_id)
              .emit("game_update_success", res.data);
          } else {
            if (res.data.data.login === 1) {
              socket.emit("isLogin", { status: false });
              return;
            }
          }
        } else {
          console.log(
            `玩家 ${removed_user.user_id} 已经成功重连, 不需要执行强制退出`
          );
          console.log("------------------------------------------");
        }
      }, 10000);
    }

    // console.log("Socket disconnected:", socket.id);
  }
}
