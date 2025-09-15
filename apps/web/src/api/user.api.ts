import { ApiResponse } from "@repo/type";
import { request } from "@/utils/request";
import type {
  UserLoginCheckRequest,
  UserLoginRequest,
  UserRegisterCheckEmailRequest,
  UserRegisterSendEmailCodeRequest,
  UserRegisterRequest,
} from "@repo/type";
import { Status } from "@repo/type";
import type { UserDetail } from "@repo/type";

export function userLoginCheck(req: UserLoginCheckRequest) {
  return request<boolean>("/user/login_check", {
    method: "GET",
    data: req,
  });
}

export function userLogin(data: UserLoginRequest) {
  return request<ApiResponse<string> & { status: Status }>("/user/login", {
    method: "POST",
    data,
    pickData: false,
  });
}

export function userRegisterCheckEmail(data: UserRegisterCheckEmailRequest) {
  return request<boolean>("/user/register/check_email", {
    method: "POST",
    data,
  });
}

// 发送邮件验证码
export function sendEmailVerificationCode(
  data: UserRegisterSendEmailCodeRequest,
) {
  return request<void>("/user/register/send_email_code", {
    method: "POST",
    data,
  });
}

export function userRegister(data: UserRegisterRequest) {
  return request<void>("/user/register", {
    method: "POST",
    data,
  });
}

export function userGetMyDetail() {
  return request<UserDetail>("/user/my_detail", {
    method: "GET",
  });
}
