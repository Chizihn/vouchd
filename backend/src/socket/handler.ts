import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../config/database";

export function socketHandler(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join trade room
    socket.on("join-trade", async (tradeId: string) => {
      socket.join(`trade:${tradeId}`);
      console.log(`Socket ${socket.id} joined trade:${tradeId}`);
    });

    // Leave trade room
    socket.on("leave-trade", (tradeId: string) => {
      socket.leave(`trade:${tradeId}`);
    });

    // Send message
    socket.on(
      "send-message",
      async (data: { tradeId: string; senderId: string; content: string }) => {
        try {
          const message = await prisma.message.create({
            data: {
              tradeId: data.tradeId,
              senderId: data.senderId,
              content: data.content,
              messageType: "TEXT",
            },
            include: {
              sender: true,
            },
          });

          // Broadcast to trade room
          io.to(`trade:${data.tradeId}`).emit("new-message", message);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      },
    );

    // Typing indicator
    socket.on("typing", (data: { tradeId: string; userId: string }) => {
      socket.to(`trade:${data.tradeId}`).emit("user-typing", data.userId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
