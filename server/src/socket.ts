import { Server } from "socket.io";
import { useSocketServer } from "socket-controllers";
// Handle connection
export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      credentials: true,
      origin: "*",
    },
    pingInterval: 5000,
    pingTimeout: 6000,
  });
  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });
  return io;
};
