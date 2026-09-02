import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid Credentials"),
  password: z.string().min(4, "Invalid Credentials"),
});

export type LoginInput = z.infer<typeof loginSchema>;
