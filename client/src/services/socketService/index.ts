import { io, Socket } from "socket.io-client";
class SocketService {
  // handling socket connection and configuration settings
  public socket: Socket | null = null;
  public connect(url: string): Promise<Socket<any, any>> {
    return new Promise((resolve, reject) => {
      this.socket = io(url);
      if (!this.socket) {
        return reject();
      }
      // handle for connection
      this.socket.on("connect", () => {
        resolve(this.socket as Socket);
      });

      this.socket.on("connect_error", (err) => reject(err));
    });
  }
}

export default new SocketService();
