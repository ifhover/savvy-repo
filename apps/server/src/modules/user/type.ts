export type LoginCheckDto = {
  account: string;
  ip: string;
};

export type LoginDto = {
  ip: string;
  account: string;
  password: string;
  captcha_id?: string;
  captcha_value?: string;
};

export type RegisterDto = {
  email: string;
  password: string;
  email_verify_code: string;
};
