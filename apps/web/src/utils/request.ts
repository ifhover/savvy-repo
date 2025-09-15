import JsCookie from "js-cookie";
import { getServerToken } from "./token";
import qs from "qs";
import { ApiResponse, Status } from "@repo/type";
import { appFunc } from "./appFunc";

export async function getToken() {
  if (typeof window === "undefined") {
    return getServerToken();
  }
  return JsCookie.get("token");
}

export type RequestOptions = RequestInit & {
  data?: Record<string, any> | FormData;
  handledError?: boolean;
  pickData?: boolean;
};

// 实现体
export async function request<T>(
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";
  let headers: Record<string, string> = {};

  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      headers = { ...options.headers };
    }
  }

  const token = await getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options?.method?.toUpperCase() === "POST" && options?.data) {
    if (options?.data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }
  }

  let fetchUrl = `${baseURL}${url}`;

  if (options?.method === "GET" && options.data) {
    fetchUrl = `${fetchUrl}?${qs.stringify(options.data)}`;
  }

  let body = undefined;
  if (
    options?.data &&
    ["POST", "PUT", "PATCH"].includes(options.method ?? "")
  ) {
    if (options.data instanceof FormData) {
      body = options.data;
    } else if (options.data instanceof URLSearchParams) {
      body = options.data.toString();
    } else {
      body = JSON.stringify(options.data);
    }
  }

  const res = await fetch(fetchUrl, {
    body,
    ...options,
    headers,
  });

  if (!res.ok) {
    appFunc.message?.error(res.statusText);
    throw new Error(res.statusText);
  }

  if (res.headers.get("Content-Type")?.includes("application/json")) {
    const data: ApiResponse<unknown> = await res.json();
    if (data.status !== Status.Success) {
      if (data.status === Status.Unauthorized) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login?message=登录已过期，请重新登录";
        }
      }
      if (options?.handledError !== false) {
        appFunc.message?.error(data.message);
        throw new Error(data.message);
      }
    }
    if (options?.pickData !== false) {
      return data.data as T;
    }
    return data as T;
  }
  return res as T;
}
