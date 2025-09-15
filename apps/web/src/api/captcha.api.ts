import { request } from "@/utils/request";
import type { Captcha } from "@repo/type";

export function captchaGet() {
  return request<Captcha>("/captcha", {
    method: "GET",
  });
}
