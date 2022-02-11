import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  SocketIO,
} from "socket-controllers";
import axios from "axios";
import { Socket, Server } from "socket.io";
import { setupInterceptorsTo } from "../Interceptors.ts";
import { client } from "../../server";

let players = [];

@SocketController()
export class MessageController {
  @OnConnect()
  public onConnection(
    @ConnectedSocket() socket: Socket,
    @SocketIO() io: Server
  ) {
    console.log("Socket connected:", socket.id);

    // listening for incoming event
    socket.on("request_login", async (data: any) => {
      const myAxios = setupInterceptorsTo(
        axios.create({
          baseURL: "https://dao.oin.finance/index/game",
          timeout: 5000,
        })
      );
      const res = await myAxios.post("/login", {
        data: { coon_id: data.connection_id, user_id: data.user_id },
      });
      var flag = players.some(function (value) {
        return value === data.user_id;
      });
      console.log(players);
      if (flag) {
        socket.emit("login_status", {
          status: "already logged",
          id: data.user_id,
        });
      } else {
        if (res.status === 200) {
          socket.emit("login_status", { status: "success", id: data.user_id });
          players.push(data.user_id);
        } else {
          socket.emit("login_status", { status: "error", id: data.user_id });
        }
      }
    });
  }

  @OnDisconnect()
  public onDisconnection(@ConnectedSocket() socket: Socket) {
    console.log("Socket disconnected:", socket.id);
  }
}
