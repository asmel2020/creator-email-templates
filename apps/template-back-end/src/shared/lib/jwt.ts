import { getContext } from "hono/context-storage";
import { jwtVerify, SignJWT } from "jose";
import type { ApiEnv } from "@/config/env";

export const encodeJWT = async (payload: any) => {
  const ctx = getContext<ApiEnv>();
  if (!ctx?.env) {
    throw new Error("Context not found");
  }
  const secret = new TextEncoder().encode(ctx.env.JWT_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
  return token;
};

export const decodeJWT = async <T = any>(token: string) => {
  const ctx = getContext<ApiEnv>();
  if (!ctx?.env) {
    throw new Error("Context not found");
  }
  const secret = new TextEncoder().encode(ctx.env.JWT_SECRET);
  return await jwtVerify<T>(token, secret);
};
