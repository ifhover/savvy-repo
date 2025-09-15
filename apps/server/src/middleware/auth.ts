import { createMiddleware } from "hono/factory";
import { BusinessError } from "@/utils/exception";
import { Status } from "@repo/type";
import { userService } from "@/modules/user/service";

const publicRoutes = [
  "/api/captcha",
  "/api/user/login",
  "/api/user/login_check",
  "/api/user/register/check_email",
  "/api/user/register/send_email_code",
  "/api/user/register",
];

export const auth = createMiddleware(async (c, next) => {
  if (publicRoutes.includes(c.req.path)) {
    await next();
    return;
  }
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (token) {
    const userDetail = await userService.getByToken(token);
    if (userDetail) {
      c.set("user", userDetail);
      await next();
      return;
    }
  }
  throw new BusinessError("Unauthorized", Status.Unauthorized);
});
