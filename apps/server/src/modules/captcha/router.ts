import { Hono } from "hono";
import { success } from "@/utils/apiResponse";
import { captchaService } from "@/modules/captcha/service";

const captchaRouter = new Hono();

captchaRouter.get("/", async (c) => {
  const data = captchaService.generate();
  return success(data);
});

export default captchaRouter;
