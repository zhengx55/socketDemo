import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
  EmitOnSuccess,
} from "socket-controllers";
import axios from "axios";
import { Socket, Server } from "socket.io";
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
        data: { coon_id: data.connection_id, user_id: data.user_id },
      });
      const user = addUser({
        socket_id: socket.id,
        user_id: data.user_id,
        connection_id: data.connection_id,
      });
      if (user) {
        if (res.status === 200) {
          socket.emit("login_status", {
            status: "success",
            id: data.user_id,
            connection_id: res.data.coon_id,
          });
        }
      } else {
        socket.emit("login_status", {
          status: "user has already logged in",
          id: data.user_id,
          connection_id: res.data.coon_id,
        });
      }
    } catch (error) {
      socket.emit("login_status", {
        status: "network error occured",
        id: data.user_id,
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
    const { user_id, connection_id } = getUser(socket.id);
    removeUser(socket.id);
    setTimeout(async () => {
      const check = getUserbyUserid(user_id);
      if (check === undefined) {
        const res = await myAxios.post("/enforceQuit", {
          data: {
            user_id: user_id,
            coon_id: connection_id,
            room_type: "pvp-auto",
          },
        });
        if (res.data.code === "200") {
          socket
            .to(res.data.data.room_id)
            .emit("game_update_success", res.data);
        }
      }
    }, 20000);
    console.log("Socket disconnected:", socket.id);
  }
}
