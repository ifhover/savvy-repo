"use client";

import { captchaGet } from "@/api/captcha.api";
import { useQuery } from "@/hooks/flowQuery";
import { Form, Input, InputRef, Modal, Spin } from "antd";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export type CaptchaForm = {
  captcha_id: string;
  captcha_value: string;
};

export type CaptchaModalInstance = {
  refreshCaptcha: () => void;
};

export type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSuccess: (data: CaptchaForm) => void;
};

const CaptchaModal = forwardRef<CaptchaModalInstance, Props>(
  ({ open, onClose, onSuccess, loading = false }, ref) => {
    // 使用SWR获取验证码数据
    const {
      data,
      refetch,
      loading: loadingCaptcha,
    } = useQuery(captchaGet, {
      immediate: false,
      onSuccess(data) {
        form.setFieldsValue({
          captcha_id: data.id,
          captcha_value: "",
        });
        inputRef.current?.input?.focus();
      },
    });

    const [form] = Form.useForm<CaptchaForm>();
    const inputRef = useRef<InputRef>(null);

    // 当组件打开时，获取新的验证码并聚焦输入框
    useEffect(() => {
      if (open) {
        refetch();
        setTimeout(() => {
          inputRef.current?.input?.focus();
        }, 100);
      }
    }, [open, inputRef]);

    // 暴露refreshCaptcha方法给父组件
    useImperativeHandle(ref, () => ({
      refreshCaptcha: () => {
        refetch();
      },
    }));

    return (
      <Modal
        title="请输入验证码"
        width={400}
        open={open}
        onCancel={onClose}
        onOk={() => form.submit()}
        okButtonProps={{ disabled: loadingCaptcha, loading }}
      >
        <Spin spinning={loadingCaptcha}>
          <Form className="mt-5" form={form} onFinish={onSuccess}>
            <Form.Item hidden name="captcha_id">
              <Input />
            </Form.Item>
            <Form.Item label="验证码">
              <div className="flex items-center gap-2">
                <Form.Item noStyle name="captcha_value">
                  <Input ref={inputRef} />
                </Form.Item>
                <div
                  className="cursor-pointer"
                  dangerouslySetInnerHTML={{ __html: data?.svg ?? "" }}
                  onClick={() => refetch()}
                />
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
);

export default CaptchaModal;
