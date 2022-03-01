import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  SocketIO,
  MessageBody,
  OnMessage,
  EmitOnSuccess,
} from "socket-controllers";
import axios from "axios";
import { Socket, Server } from "socket.io";
import { setupInterceptorsTo } from "../Interceptors.ts";
import { addUser, removeUser } from "../../utils/user";

@SocketController()
export class MessageController {
  @OnConnect()
  public onConnection(
    @ConnectedSocket() socket: Socket,
    @SocketIO() io: Server
  ) {
    console.log("Socket connected:", socket.id);
  }

  @OnMessage("request_login")
  @EmitOnSuccess("Login Request received")
  public async Login(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
    @SocketIO() io: Server
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
      const user = addUser({ socket_id: socket.id, user_id: data.user_id });
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
    socket.on("user_disconnected", (msg: string) => {
      console.log(msg);
    });
    removeUser(socket.id);
    console.log("Socket disconnected:", socket.id);
  }
}
