import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
  SocketIO,
  EmitOnSuccess,
  EmitOnFail,
  SkipEmitOnEmptyResult,
} from "socket-controllers";
import axios from "axios";
import { Socket, Server } from "socket.io";
import { setupInterceptorsTo } from "../Interceptors.ts";

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
        data: { coon_id: data.connection_id },
      });
      if (res.status === 200) {
        socket.emit("login_status", { status: "success" });
      } else {
        socket.emit("login_status", { status: "error" });
      }
    });
  }

  @OnDisconnect()
  public onDisconnection(@ConnectedSocket() socket: Socket) {
    console.log("Socket disconnected:", socket.id);
  }

  @OnMessage("test")
  public async save(
    @ConnectedSocket() socket: any,
    @MessageBody() message: any
  ) {
    if (message.message === "req for attack command") {
      const myAxios = setupInterceptorsTo(
        axios.create({
          baseURL: "https://api.publicapis.org",
          timeout: 5000,
        })
      );
      myAxios
        .get("/entries")
        .then((response) => {
          socket.emit("message_saved", response.data.count);
        })
        .catch((error) => {
          socket.emit("message_error", error);
        });
    }
  }
}
