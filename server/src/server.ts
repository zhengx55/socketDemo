#!/usr/bin/env node
import "reflect-metadata";
import app from "./app";
var debug = require("debug")("socketio-server:server");
import * as http from "http";
import socketServer from "./socket";
import { createClient } from "redis";
import Redis from "ioredis";
import "dotenv/config";
import { Room } from "./utils/room";
import { getUserbyUserid } from "./utils/user";

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

function normalizePort(val: any) {
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

function onError(error: { syscall: string; code: any }) {
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

const redis = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

const client = createClient({
  socket: {
    port: 6379,
    host: process.env.REDIS_HOST,
    connectTimeout: 1000,
  },
  password: process.env.REDIS_PASSWORD,
});

const runRedis = async () => {
  redis.subscribe("matchMsg", (err, count) => {
    if (err) {
      console.error("Failed to subscribe: %s", err.message);
    } else {
      console.log(
        `Subscribed successfully! This client is currently subscribed to ${count} channels.`
      );
    }
  });

  redis.on("message", (channel, msg) => {
    let match_query = JSON.parse(msg);
    if (match_query) {
      match_query.map((item: Room) => {
        Object.keys(item.playerList).forEach((player: any) => {
          const user = getUserbyUserid(player);
          io.to(user.socket_id).emit("match_info", {
            data: item,
            status: "success",
          });
        });
      });
    }
  });
};
