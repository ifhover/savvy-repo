"use client";

import {
  userRegisterCheckEmail,
  sendEmailVerificationCode,
  userRegister,
} from "@/api/user.api";
import CaptchaModal, { CaptchaForm } from "@/components/CaptchaModal";
import { Button, Checkbox, Form, Input, Spin, App } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import useSWRMutation from "swr/mutation";
import type {
  UserRegisterRequest,
  UserRegisterSendEmailCodeRequest,
} from "@repo/type";

export default function Register() {
  const { message } = App.useApp();
  const router = useRouter();
  const { trigger: triggerCheckEmail, isMutating: isMutatingCheckEmail } =
    useSWRMutation(
      "/user/register/check_email",
      async (_, { arg }: { arg: string }) =>
        await userRegisterCheckEmail({ email: arg }),
    );

  const { trigger: triggerSendEmailCode, isMutating: isMutatingSendEmailCode } =
    useSWRMutation(
      "/user/register/send_email_code",
      async (_, { arg }: { arg: UserRegisterSendEmailCodeRequest }) =>
        await sendEmailVerificationCode(arg),
      {
        onSuccess() {
          message.success("验证码已发送");
          setCaptchaModalOpen(false);
          setCountdown(60); // 设置60秒倒计时
        },
      },
    );

  const [form] = Form.useForm();
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 处理发送验证码按钮点击
  const handleSendEmailCode = async () => {
    // 先验证邮箱字段
    await form.validateFields(["email"]);
    // 打开图像验证码弹窗
    setCaptchaModalOpen(true);
  };

  // 图像验证码验证成功后发送邮件验证码
  const handleCaptchaSuccess = async (captchaData: CaptchaForm) => {
    const email = form.getFieldValue("email");
    await triggerSendEmailCode({
      email,
      captcha_id: captchaData.captcha_id,
      captcha_value: captchaData.captcha_value,
    });
  };

  const { trigger: triggerRegister, isMutating: isMutatingRegister } =
    useSWRMutation(
      "/user/register",
      async (_, { arg }: { arg: UserRegisterRequest }) =>
        await userRegister(arg),
      {
        onSuccess() {
          message.success("注册成功");
          router.push("/auth/login");
        },
      },
    );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Register</h1>
      <p className="text-sm text-gray-500 mb-7">请输入您的信息</p>
      <CaptchaModal
        onClose={() => setCaptchaModalOpen(false)}
        open={captchaModalOpen}
        onSuccess={handleCaptchaSuccess}
        loading={isMutatingSendEmailCode}
      />
      <Spin spinning={isMutatingCheckEmail}>
        <Form
          layout="vertical"
          size="large"
          form={form}
          onFinish={triggerRegister}
        >
          <Form.Item
            label="邮箱"
            name={"email"}
            validateTrigger={["onBlur", "onChange"]}
            validateFirst
            rules={[
              { required: true, message: "请输入邮箱" },
              {
                validateTrigger: "onBlur",
                type: "email",
                message: "请输入正确格式的邮箱",
              },
              {
                validateTrigger: [],
                async validator(_, value: string) {
                  let valid = await triggerCheckEmail(value);
                  if (valid) return Promise.resolve();
                  return Promise.reject("当前邮箱已被注册");
                },
              },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="验证码" required>
            <div className="flex gap-x-2">
              <Form.Item
                noStyle
                label="验证码"
                name="email_verify_code"
                rules={[{ required: true, message: "请输入邮箱验证码" }]}
              >
                <Input placeholder="请输入邮箱验证码" />
              </Form.Item>
              <Button
                type="primary"
                onClick={handleSendEmailCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后重试` : "发送"}
              </Button>
            </div>
          </Form.Item>
          <Form.Item
            label="密码"
            name={"password"}
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("password") !== value) {
                    return Promise.reject("两次输入的密码不一致");
                  } else {
                    return Promise.resolve();
                  }
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入密码" />
          </Form.Item>
          <Form.Item>
            <Form.Item
              noStyle
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator(_, value) {
                    console.log(value);
                    if (!value) {
                      return Promise.reject("请勾选注册协议");
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
              ]}
            >
              <Checkbox>
                同意<Link href="">《注册协议》</Link>
              </Checkbox>
            </Form.Item>
          </Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            loading={isMutatingRegister}
          >
            注册
          </Button>
        </Form>
        <div className="text-center mt-5">
          已有账号？<Link href="./login">点击登录</Link>
        </div>
      </Spin>
    </div>
  );
}
