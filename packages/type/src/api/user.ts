export type UserLoginCheckRequest = {
  account: string;
};

export type UserLoginRequest = {
  account: string;
  password: string;
  captcha_id?: string;
  captcha_value?: string;
};

export type UserRegisterCheckEmailRequest = {
  email: string;
};

export type UserRegisterSendEmailCodeRequest = {
  email: string;
  captcha_id: string;
  captcha_value: string;
};

export type UserRegisterRequest = {
  email: string;
  password: string;
  email_verify_code: string;
};

export type UserDetail = {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
};
