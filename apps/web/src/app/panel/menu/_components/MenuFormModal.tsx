import { Menu } from "@repo/type";
import { Modal, Button, App, Input, TreeSelect, Spin } from "antd";
import { Form } from "antd";
import { useMutate, useQuery } from "@/hooks/flowQuery";
import { menuApi } from "@/api/menu.api";
import { useEffect } from "react";
import useSWR from "swr";

export function MenuFormModal(props: {
  id?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: Menu) => void;
}) {
  const [form] = Form.useForm<Menu>();

  const { loading, refetch } = useQuery(() => menuApi.get(props.id!), {
    immediate: false,
    onSuccess(data) {
      form.setFieldsValue(data);
    },
  });

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      if (props.id) {
        refetch();
      }
    }
  }, [props.open, props.id]);

  const { trigger, loading: loadingTrigger } = useMutate(
    props.id ? menuApi.update : menuApi.add
  );

  const { message } = App.useApp();

  async function handleSubmit(data: Menu) {
    await trigger(data);
    props.onClose();
    props.onSuccess?.(data);
    message.success(props.id ? "更新成功" : "添加成功");
  }

  const { data: menus } = useSWR("menuApi.list", menuApi.list);

  return (
    <Modal
      title="菜单表单"
      open={props.open}
      onCancel={props.onClose}
      okButtonProps={{ loading: loadingTrigger }}
      onOk={() => form.submit()}
    >
      <Spin spinning={loading}>
        <Form
          className="mt-5"
          form={form}
          onFinish={handleSubmit}
          labelCol={{ span: 4 }}
        >
          <Form.Item hidden name="id">
            <Input />
          </Form.Item>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="路径"
            name="path"
            rules={[{ required: true, message: "请输入路径" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="父级菜单" name="pid" initialValue={null}>
            <TreeSelect
              placeholder="请选择父级菜单（选填）"
              treeData={menus}
              fieldNames={{ label: "name", value: "id" }}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
