"use client";

import PageContainer from "@/components/PageContainer";
import { menuApi } from "@/api/menu.api";
import { Table, Button, Card, Space, App } from "antd";
import { MenuFormModal } from "./_components/MenuFormModal";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";

export default function MenuPage() {
  const {
    data: menus,
    isLoading,
    mutate,
  } = useSWR("menuApi.list", menuApi.list);

  function handleEdit(id: string) {
    setOpen(true);
    setId(id);
  }

  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string | undefined>(undefined);

  function handleAdd() {
    setOpen(true);
    setId(undefined);
  }

  const { modal, message } = App.useApp();
  const swrConfig = useSWRConfig();

  function handleDelete(id: string) {
    modal.confirm({
      title: "删除菜单",
      content: "确定删除该菜单吗？",
      onOk: async () => {
        await menuApi.delete(id);
        message.success("删除成功");
        mutate();
      },
    });
  }

  return (
    <PageContainer>
      <MenuFormModal
        id={id}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onSuccess={() => {
          mutate();
          swrConfig.mutate("menuApi.self");
        }}
      />
      <Card
        loading={isLoading}
        title="菜单列表"
        extra={
          <Button type="primary" onClick={() => handleAdd()}>
            添加
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={menus}
          expandable={{ defaultExpandAllRows: true }}
          columns={[
            {
              title: "名称",
              dataIndex: "name",
            },
            {
              title: "路径",
              dataIndex: "path",
            },
            {
              title: "操作",
              dataIndex: "action",
              render: (_, record) => (
                <Space size="middle">
                  <a onClick={() => handleEdit(record.id)}>编辑</a>
                  <a onClick={() => handleDelete(record.id)}>删除</a>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
}
