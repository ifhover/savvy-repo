import { VerifyCodeBizType, VerifyCodeChannel } from "@repo/type";

export type VerifyCodeDto = {
  bizType: VerifyCodeBizType;
  channel: VerifyCodeChannel;
  receiver: string;
  code: string;
};

export type VerifyCodeAdd = {
  bizType: VerifyCodeBizType;
  receiver: string;
  channel: VerifyCodeChannel;
};
