#!/usr/bin/env node
import "reflect-metadata";
import app from "./app";
var debug = require("debug")("socketio-server:server");
import * as http from "http";
import socketServer from "./socket";
import { createClient } from "redis";
import "dotenv/config";
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "9000");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

const io = socketServer(server);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
  console.log("Server Running on Port: ", port);
}

const runRedis = async () => {
  const pubClient = createClient({
    socket: {
      port: 6379,
      host: process.env.REDIS_HOST,
      connectTimeout: 1000,
    },
    password: process.env.REDIS_PASSWORD,
  });
  const subClient = pubClient.duplicate();

  pubClient.on("error", (error: Error) => console.error(error));
  subClient.on("error", (error: Error) => console.error(error));

  pubClient.on("connect", () =>
    console.log("pubClient connected and starting initiator")
  );
  pubClient.on("ready", () => console.log("pubClient is ready"));
  subClient.on("connect", () =>
    console.log("subClient connected and starting initiator")
  );
  subClient.on("ready", () => console.log("subClient is ready"));
  (async () => {
    await pubClient.connect();
    await subClient.connect();

    subClient.subscribe("matchMsg", (message: string) => {
      console.log(message);
    });
  })();
};
runRedis();
