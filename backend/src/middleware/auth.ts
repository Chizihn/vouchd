import { Request } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

interface JWTPayload {
  walletAddress: string;
  userId: string;
}

export async function authMiddleware(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret",
    ) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export function generateToken(userId: string, walletAddress: string): string {
  return jwt.sign(
    { userId, walletAddress },
    process.env.JWT_SECRET || "default-secret",
    { expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d" },
  );
}
