import { Server } from "socket.io";

import { ChatMessage } from "../models/chatMessage.model.js";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", async (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
      }

      const savedMessages = await ChatMessage.find({ roomId: path }).sort({ createdAt: 1 }).limit(50);

      for (const message of savedMessages) {
        io.to(socket.id).emit("chat-message", message.message, message.sender, "server", message.createdAt);
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit("chat-message", messages[path][a].data, messages[path][a].sender, messages[path][a]["socket-id-sender"]);
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", async (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound], [roomKey, roomValue]) => {
        if (!isFound && roomValue.includes(socket.id)) {
          return [roomKey, true];
        }

        return [room, isFound];
      }, ["", false]);

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        const newMessage = {
          sender,
          data,
          "socket-id-sender": socket.id,
        };

        messages[matchingRoom].push(newMessage);

        await ChatMessage.create({
          roomId: matchingRoom,
          sender,
          message: data,
        });

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id, new Date().toISOString());
        });
      }
    });

    socket.on("participant-status", ({ user, action }) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound], [roomKey, roomValue]) => {
        if (!isFound && roomValue.includes(socket.id)) {
          return [roomKey, true];
        }

        return [room, isFound];
      }, ["", false]);

      if (!found || !matchingRoom || !user || !action) return;

      connections[matchingRoom].forEach((elem) => {
        io.to(elem).emit("participant-status", { user, action });
      });
    });

    socket.on("disconnect", () => {
      const key = Object.keys(connections).find((roomKey) => connections[roomKey].includes(socket.id));

      if (!key) return;

      for (let a = 0; a < connections[key].length; ++a) {
        io.to(connections[key][a]).emit("user-left", socket.id);
      }

      const index = connections[key].indexOf(socket.id);
      connections[key].splice(index, 1);

      if (connections[key].length === 0) {
        delete connections[key];
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};

