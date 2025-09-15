"use client";

import { DashboardOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout } from "antd";
import { JSX, useMemo, useState } from "react";
import { FaIndent, FaOutdent } from "react-icons/fa6";
import { Avatar } from "antd";
import { FaUser } from "react-icons/fa6";
import { userGetMyDetail } from "@/api/user.api";
import { useQuery } from "@/hooks/flowQuery";
import useSWR from "swr";
import { menuApi } from "@/api/menu.api";
import { MenuTree } from "@repo/type";

function MenuIcon(props: { data: MenuTree }): JSX.Element {
  return <DashboardOutlined />;
}

export default function ({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: userInfo } = useQuery(userGetMyDetail);
  const { data: selfMenus } = useSWR("menuApi.self", menuApi.self);

  const menus: MenuProps["items"] = useMemo(() => {
    function recurse(menus: MenuTree[]): MenuProps["items"] {
      return menus.map((menu) => {
        return {
          key: menu.path,
          icon: <MenuIcon data={menu} />,
          label: <Link href={menu.path}>{menu.name}</Link>,
          children: menu.children ? recurse(menu.children) : undefined,
        };
      });
    }
    return recurse(selfMenus || []);
  }, [selfMenus]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 左侧菜单 */}
      <Layout.Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
      >
        <div className="px-2">
          <div className="text-white h-15 flex items-center justify-center text-2xl font-bold mb-2 overflow-hidden whitespace-nowrap">
            {collapsed ? "F" : "Flow Site"}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={menus}
          />
        </div>
      </Layout.Sider>
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="h-15 shadow-2xs bg-white flex items-center justify-between w-full px-4">
          <div
            className="text-[16px] p-3 rounded-md hover:bg-gray-200 cursor-pointer transition-all bg-gray-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <FaIndent /> : <FaOutdent />}
          </div>
          <div className="flex items-center gap-2">
            <Avatar
              icon={<FaUser />}
              className="mr-1 bg-primary-400 text-white text-[14px]"
            />
            <span className="text-sm text-gray-800">{userInfo?.email}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto relative">{children}</div>
      </div>
    </div>
  );
}
