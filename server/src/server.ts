#!/usr/bin/env node
import "reflect-metadata";
import app from "./app";
var debug = require("debug")("socketio-server:server");
import * as http from "http";
import socketServer from "./socket";
import { createClient } from "redis";
import "dotenv/config";

const mockData = [
  {
    playerList: {
      "1": { user_id: 1, hp: 1000, attack: 200, armor: 300, type: "1" },
      "4": { user_id: 4, hp: 900, attack: 150, armor: 400, type: "1" },
    },
    room_now_current_user: 4,
    room_id: "030157535",
    room_type: "pvp-auto",
    room_status: 1,
    room_battle_logs: [],
    room_battle_reward: [],
    room_start_time: 1646112841,
    room_end_time: 0,
    command: "attack",
    hash: "gtvvlGr99rgglihpctog2OZ4ZnjQOtKjw+W0nJBGURuskxWQkdBwkYbZRLmpiHPtA+uDdD+dtV4ivSRjMxGJnn+8TMvjy+nQbWpU7CFVZFpRPr2YtJ+ADtZGYh1yAz681p+brcnDYIj1e5OlrAHRyzCNHoL/epYKJwjAkwopGQfY1jAoWvwTUmFREMhcxbnr",
  },
];
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
  runRedis();
  console.log("Server Running on Port: ", port);
}

export const client = createClient({
  socket: {
    port: 6379,
    host: process.env.REDIS_HOST,
    connectTimeout: 1000,
  },
  password: process.env.REDIS_PASSWORD,
});

const runRedis = async () => {
  client.on("error", (error: Error) => console.error(error));
  client.on("connect", () =>
    console.log("Redis client connected and starting initiator")
  );
  client.on("ready", () => console.log("Redis client is ready"));
  const pubClient = client.duplicate();
  await client.connect();
  await pubClient.connect();
  // Redis subscriber return info of matching information
  setInterval(() => {
    pubClient.publish("some-key", JSON.stringify(mockData));
  }, 1000);
};
