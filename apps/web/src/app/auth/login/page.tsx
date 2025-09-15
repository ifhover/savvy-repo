"use client";

import { userLogin, userLoginCheck } from "@/api/user.api";
import CaptchaModal, {
  CaptchaForm,
  CaptchaModalInstance,
} from "@/components/CaptchaModal";
import { Alert, App, Button, Checkbox, Form, Input } from "antd";
import Link from "next/link";
import { useRef, useState } from "react";
import jsCookie from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { UserLoginRequest } from "@repo/type";
import { Status } from "@repo/type";
import { useMutate } from "@/hooks/flowQuery/mutate";

export default function Login() {
  // 控制验证码模态框的显示状态
  const [open, setOpen] = useState(false);
  const { message } = App.useApp();
  const query = useSearchParams();

  const router = useRouter();
  // 使用 SWR Mutation 进行登录检查
  const { trigger: triggerCheck, loading: loadingCheck } = useMutate(
    userLoginCheck,
    {
      onSuccess(res) {
        if (res) {
          triggerLogin(form.getFieldsValue()); // 如果检查通过，触发登录
        } else {
          setOpen(true); // 如果检查不通过，打开验证码模态框
        }
      },
    },
  );

  // 使用 SWR Mutation 进行登录
  const {
    trigger: triggerLogin,
    loading: loadingLogin,
    error,
  } = useMutate(userLogin, {
    onSuccess(res) {
      if (res.status === Status.Success) {
        message.success("登录成功"); // 登录成功提示
        jsCookie.set("token", res.data, {
          expires: dayjs().add(1, "day").toDate(),
        });
        router.push("/panel");
        setOpen(false); // 关闭验证码模态框
      } else {
        if (res.status !== Status.Captcha) {
          setOpen(false); // 特定错误码时关闭模态框
        } else {
          captchaModalRef.current?.refreshCaptcha(); // 刷新验证码
        }
      }
    },
  });

  // 创建表单实例
  const [form] = Form.useForm<UserLoginRequest>();

  // 表单提交时的处理函数
  const onFinish = (values: UserLoginRequest) => {
    if (open) {
      triggerLogin(values); // 如果验证码模态框打开，直接登录
    } else {
      triggerCheck({ account: values.account }); // 否则，先进行登录检查
    }
  };

  // 验证码成功后的处理函数
  const onCaptchaSuccess = async (data: CaptchaForm) => {
    form.setFieldsValue({
      captcha_id: data.captcha_id,
      captcha_value: data.captcha_value,
    });
    form.submit(); // 提交表单
  };

  // 创建验证码模态框的引用
  const captchaModalRef = useRef<CaptchaModalInstance>(null);

  return (
    <div>
      {/* 验证码模态框组件 */}
      <CaptchaModal
        loading={loadingLogin}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onCaptchaSuccess}
        ref={captchaModalRef}
      />
      {query.get("message") && (
        <Alert
          message={query.get("message")}
          type="error"
          className="mb-3"
          showIcon
          icon={<ExclamationCircleOutlined className="text-red-500" />}
        />
      )}
      <h1 className="text-3xl font-bold mb-2">Welcome back👋</h1>
      <p className="text-sm text-gray-500 mb-7">请输入您的登录信息</p>
      {/* 登录表单 */}
      <Form layout="vertical" size="large" onFinish={onFinish} form={form}>
        <Form.Item hidden name="captcha_id">
          <Input />
        </Form.Item>
        <Form.Item hidden name="captcha_value">
          <Input />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="account"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "请输入正确格式的邮箱" },
          ]}
        >
          <Input autoFocus placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <div className="flex justify-between items-center mb-6">
          <Checkbox>记住我</Checkbox>
          <Link href="/forgot-password" className=" text-primary-500">
            忘记密码
          </Link>
        </div>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loadingCheck || loadingLogin}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
      <div className="flex justify-center items-center mt-5 text-sm">
        <div>
          没有账号？
          <Link href="./register" prefetch className="text-primary-500">
            点击注册
          </Link>
        </div>
      </div>
    </div>
  );
}
