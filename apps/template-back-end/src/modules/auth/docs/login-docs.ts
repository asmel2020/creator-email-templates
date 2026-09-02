import { describeRoute } from "hono-openapi";

const loginDocs = describeRoute({
  description: "Authenticate a user with email and password, returning a JWT token.",
  parameters: [
    { name: "email", in: "body", required: true, description: "User email", schema: { type: "string" }, example: "[EMAIL_ADDRESS]" },
    { name: "password", in: "body", required: true, description: "User password", schema: { type: "string" }, example: "password" },
  ],
  responses: {
    200: { description: "Successfully authenticated" },
    400: { description: "Validation error" },
    401: { description: "Invalid email or password" },
  },
});

export { loginDocs };
