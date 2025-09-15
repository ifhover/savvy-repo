import { createMiddleware } from "hono/factory";
export const auth = createMiddleware(async (c, next) => {
    const token = c.req.header("Authorization");
    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
});
