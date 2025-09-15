import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/middleware/auth";
import { BusinessError } from "@/utils/exception";
import userRouter from "@/modules/user/router";
import captchaRouter from "@/modules/captcha/router";
import menuRouter from "@/modules/menu/router";

export const api = new Hono();

api.onError((err, c) => {
  if (err instanceof BusinessError) {
    return c.json(
      { status: err.status, message: err.message, data: null },
      200
    );
  }
  console.log(err);
  return c.json({ status: -2, error: err.message, data: null }, 500);
});

api.use(cors());
api.use(auth);

api.route("/user", userRouter);
api.route("/captcha", captchaRouter);
api.route("/menu", menuRouter);
