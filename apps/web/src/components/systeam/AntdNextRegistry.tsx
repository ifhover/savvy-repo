"use client";

import { App, ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import zhCN from "antd/locale/zh_CN";

export function AntdNextRegistry({
  children,
  colorPrimary,
}: {
  children: React.ReactNode;
  colorPrimary: string;
}) {
  return (
    <AntdRegistry layer>
      <ConfigProvider
        locale={zhCN}
        theme={{
          cssVar: true,
          hashed: false,
          token: {
            colorPrimary,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
