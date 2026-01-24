import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./resolvers";
import { prisma } from "./config/database";
import { authMiddleware } from "./middleware/auth";
import { socketHandler } from "./socket/handler";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  },
});

socketHandler(io);

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  }),
);
app.use(express.json());

// Root endpoint for UptimeRobot / Render health checks
app.get("/", (_req, res) => {
  res.json({ 
    name: "Vouchd API",
    status: "ok", 
    version: "1.0.0",
    graphql: "/graphql",
    timestamp: new Date().toISOString() 
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Apollo Server setup
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

export async function startServer() {
  await apolloServer.start();

  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const user = await authMiddleware(req);
        return { user, prisma };
      },
    }),
  );

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔌 Socket.IO ready at http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

export { app, io, prisma };
