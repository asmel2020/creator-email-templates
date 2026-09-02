import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/shared/db";
import { user as userTable } from "@/shared/db/schema";
import { encodeJWT } from "@/shared/lib/jwt";
import { LoginInput } from "./validate";
import { HTTPException } from "hono/http-exception";

export const login = async (loginInput: LoginInput) => {
  const { email, password } = loginInput;

  const [found] = await db()
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (!found) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const valid = await bcryptjs.compare(password, found.password);
  if (!valid) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const token = await encodeJWT({ sub: found.id });

  return { token };
};
