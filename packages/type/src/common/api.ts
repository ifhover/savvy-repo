export enum Status {
  Success = 0,
  Unauthorized = 400,
  Business = -1,

  // 业务
  Captcha = 1001,
}

export type PageRequest<T extends Record<string, unknown> = {}> = T & {
  page_size: number;
  page_index: number;
};

export type PageData<T = {}> = {
  data: T[];
  page_size: number;
  page_index: number;
  total: number;
};

export type ApiResponse<T> = {
  status: Status;
  message: string;
  data: T;
};
