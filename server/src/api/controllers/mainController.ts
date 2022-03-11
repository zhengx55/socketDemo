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
    console.log("Socket connected:", socket.id);
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
        baseURL: "https://dao.oin.finance/index/game",
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
          user_id: res.data.data.user_id,
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
        baseURL: "https://dao.oin.finance/index/game",
        timeout: 5000,
      })
    );
    const removed_user = getUser(socket.id);
    removeUser(socket.id);
    if (removed_user) {
      setTimeout(async () => {
        const check = getUserbyUserid(removed_user.user_id);
        if (check === undefined) {
          const res = await myAxios.post("/enforceQuit", {
            token: removed_user.token,
            room_type: "pvp-auto",
          });
          if (res.data.code === "200") {
            socket
              .to(res.data.data.room_id)
              .emit("game_update_success", res.data);
          }
        }
      }, 30000);
    }

    console.log("Socket disconnected:", socket.id);
  }
}
