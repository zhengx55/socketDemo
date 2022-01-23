import { Server } from "socket.io";
import { useSocketServer } from "socket-controllers";
// Handle connection
export default (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  useSocketServer(io, { controllers: [__dirname + "/api/controllers/*.ts"] });
  return io;
};
