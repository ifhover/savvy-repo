import { Hono } from "hono";
import { success } from "@/utils/apiResponse";
import { getConnInfo } from "@hono/node-server/conninfo";
import { validate } from "@/utils/validator";
import { z } from "zod/v4";
import {
  UserLoginCheckRequest,
  UserLoginRequest,
  UserRegisterCheckEmailRequest,
  UserRegisterRequest,
  UserRegisterSendEmailCodeRequest,
  VerifyCodeBizType,
  VerifyCodeChannel,
} from "@repo/type";
import { BusinessError } from "@/utils/exception";
import { userService } from "@/modules/user/service";
import { verifyCodeService } from "@/modules/verifyCode/service";
import { captchaService } from "@/modules/captcha/service";

const userRouter = new Hono();

userRouter.get("/login_check", (c) => {
  const { account } = validate<UserLoginCheckRequest>(
    c.req.query(),
    z.object({
      account: z.string().trim().nonempty(),
    }),
  );

  const ip = getConnInfo(c).remote.address;
  if (!ip) throw new BusinessError("获取客户端IP失败");
  return success(userService.loginCheck({ account, ip }));
});

userRouter.post("/login", async (c) => {
  const data = validate<UserLoginRequest>(
    await c.req.json(),
    z.object({
      account: z.string().trim().nonempty(),
      password: z.string().trim().nonempty(),
      captcha_id: z.string().optional(),
      captcha_value: z.string().optional(),
    }),
  );
  return success(
    await userService.login({
      ...data,
      ip: getConnInfo(c).remote.address ?? "",
    }),
  );
});

userRouter.post("/register/check_email", async (c) => {
  const data = validate<UserRegisterCheckEmailRequest>(
    await c.req.json(),
    z.object({
      email: z.email().trim().nonempty(),
    }),
  );
  return success(await userService.registerCheckEmail(data.email));
});

// 发送邮件验证码
userRouter.post("/register/send_email_code", async (c) => {
  const data = validate<UserRegisterSendEmailCodeRequest>(
    await c.req.json(),
    z.object({
      email: z.email().trim().nonempty(),
      captcha_id: z.string().trim().nonempty(),
      captcha_value: z.string().trim().nonempty(),
    }),
  );
  captchaService.verifyThrow(data.captcha_id, data.captcha_value);

  await verifyCodeService.add({
    receiver: data.email,
    channel: VerifyCodeChannel.邮箱,
    bizType: VerifyCodeBizType.注册,
  });

  return success();
});

userRouter.post("/register", async (c) => {
  const data = validate<UserRegisterRequest>(
    await c.req.json(),
    z.object({
      email: z.email().trim().nonempty(),
      password: z.string().trim().nonempty(),
      email_verify_code: z.string().trim().nonempty(),
    }),
  );
  await userService.register(data);
  return success();
});

// 获取用户信息
userRouter.get("/my_detail", (c) => {
  const user = c.get("user");
  return success(user);
});

export default userRouter;
