import NodeCache from "node-cache";
import type { Captcha } from "@repo/type";
import svgCaptcha from "svg-captcha";
import { v7 } from "uuid";
import { BusinessError } from "@/utils/exception";

const cache = new NodeCache({
  stdTTL: 60 * 5,
});

export const captchaService = {
  generate(): Captcha {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 30,
    });
    const id = v7();
    cache.set(id, captcha.text.toLowerCase());
    return {
      id: id,
      svg: captcha.data,
    };
  },
  verify(id: string, text: string): boolean {
    const captcha = cache.get<string>(id);
    cache.del(id);
    if (!captcha) return false;
    return captcha === text.toLowerCase();
  },
  verifyThrow(id: string, text: string) {
    if (!this.verify(id, text)) throw new BusinessError("验证码错误");
  },
};
