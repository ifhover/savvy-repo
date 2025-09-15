export type Captcha = {
  id: string;
  svg: string;
};

export type CaptchaVerifyDto = {
  id: string;
  value: string;
};
