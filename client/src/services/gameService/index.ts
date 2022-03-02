import { Socket } from "socket.io-client";

class GameService {
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
    return new Promise((rs, rj) => {
      socket.emit("join_game", { roomId });
      socket.on("room_joined", () => rs(true));
      socket.on("room_join_error", ({ error }) => rj(error));
    });
  }

  public async onStartGame(
    socket: Socket,
    roomId: string
    // listener: (options: IStartGame) => void
  ): Promise<any> {
    return new Promise((rs, rj) => {
      socket.emit("game_start", { roomId });
      socket.on("start_game", (msg) => rs(msg));
      socket.on("pendings_game", ({ msg }) => rj(msg));
    });
    // socket.on("start_game", listener);
  }

  public async matchGame(
    socket: Socket,
    userConnection: string,
    userId: string
  ): Promise<any> {
    return new Promise((rs, rj) => {
      socket?.emit("match_room", {
        connection_id: userConnection,
        user_id: userId,
      });
      socket.on("match_info", (res) => rs(res));
      socket.on("match_error", ({ error }) => rj(error));
    });
  }

  public async gameUpdate(
    socket: Socket,
    userConnection: string,
    data: any
  ): Promise<any> {
    return new Promise((rs, rj) => {
      socket?.emit("update_game", {
        connection_id: userConnection,
        room_id: data.room_id,
        user_id: data.user_id,
        battle_type: data.battle_type,
        command: data.command,
        button: data.button,
      });
      socket
        .off("game_update_success")
        .on("game_update_success", (res) => rs(res));
      socket
        .off("game_update_error")
        .on("game_update_error", ({ error }) => rj(error));
    });
  }

  public async gameInProgress(
    socket: Socket,
    userConnection: string,
    userId: string
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      socket?.emit("game_progress_check", {
        connection_id: userConnection,
        user_id: userId,
      });
      socket
        .off("game_status")
        .on("game_status", (res: { data: any; status: boolean }) => {
          if (res.status) {
            resolve({ status: true, data: res.data });
          } else {
            resolve({ status: false, data: res.data });
          }
        });
    });
  }
}

export default new GameService();
