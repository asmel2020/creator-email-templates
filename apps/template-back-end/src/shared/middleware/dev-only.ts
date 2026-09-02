// Middleware to restrict routes to development environment only
const devOnly = () => async (c: any, next: any) => {
  if (c.env.ENVIRONMENT !== "development") {
    return c.notFound();
  }
  await next();
};

export { devOnly };
