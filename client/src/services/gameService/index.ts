import { Socket } from "socket.io-client";

class GameService {
  public loginInGame = (
    socket: Socket,
    connection_id: string,
    user_id: string,
    user_address: string
  ) => {
    return new Promise((resolve, reject) => {
      socket.emit("request_login", {
        connection_id,
        user_id,
        user_address,
      });
      socket.on("login_status", (res) => {
        if (res.status === "success") {
          resolve(res);
        } else {
          reject(false);
        }
      });
    });
  };

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
    token: string,
    user_id: string
  ): Promise<any> {
    return new Promise((rs, rj) => {
      socket?.emit("match_room", {
        token,
        user_id,
      });
      socket.on("match_info", (res) => rs(res));
      socket.on("match_error", ({ error }) => rj(error));
    });
  }

  public async quitMatch(
    socket: Socket,
    userId: string,
    token: string
  ): Promise<any> {
    return new Promise((rs, rj) => {
      socket?.emit("quit_match", {
        user_id: userId,
        token,
      });
      socket.on("quit_success", () => rs(true));
      socket.on("quit_error", () => rj(false));
    });
  }

  public async gameUpdate(
    socket: Socket,
    token: string,
    data: any
  ): Promise<any> {
    return new Promise((rs, rj) => {
      socket?.emit("update_game", {
        token: token,
        user_id: data.user_id,
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
    token: string,
    user_id: string
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      socket?.emit("game_progress_check", {
        token,
        user_id,
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
