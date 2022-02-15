import { Socket } from "socket.io-client";
import { IPlayMatrix, IStartGame } from "../../components/Game";

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
      socket.on("match_error", ({ error }) => rs(error));
    });
  }

  public async updateGame(socket: Socket, gameMatrix: IPlayMatrix) {
    socket.emit("update_game", { matrix: gameMatrix });
  }

  public async onGameUpdate(
    socket: Socket,
    listener: (matrix: IPlayMatrix) => void
  ) {
    socket.on("on_game_update", ({ matrix }) => listener(matrix));
  }

  public async gameWin(socket: Socket, message: string) {
    socket.emit("game_win", { message });
  }

  public async onGameWin(socket: Socket, listener: (message: string) => void) {
    socket.on("on_game_win", ({ message }) => listener(message));
  }
}

export default new GameService();
