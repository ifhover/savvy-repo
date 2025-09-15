"use client";

import { App, message } from "antd";
import { useEffect } from "react";
import Cookies from "js-cookie";

export const appFunc: {
  message?: ReturnType<typeof App.useApp>["message"];
} = {
  message,
};

export function AppFuncInject() {
  const app = App.useApp();
  useEffect(() => {
    appFunc.message = app.message;
  }, []);

  return null;
}

// 移除token
export function removeToken() {
  Cookies.remove("token");
}
