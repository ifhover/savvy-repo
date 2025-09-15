import { db } from "@/db/db";
import { and, eq, isNull } from "drizzle-orm";
import { verifyCode } from "@/db/schema";
import dayjs from "dayjs";
import { VerifyCodeAdd, VerifyCodeDto } from "@/modules/verifyCode/type";
import { VerifyCodeChannel } from "@repo/type";
import { z } from "zod/v4";
import { BusinessError } from "@/utils/exception";
import { emailService } from "@/modules/email/service";

export const verifyCodeService = {
  // 校验验证码
  async verify({
    bizType,
    receiver,
    code,
    channel,
  }: VerifyCodeDto): Promise<boolean> {
    // 查找未使用且未过期的验证码
    const verifyRecord = await db.query.verifyCode.findFirst({
      where: and(
        eq(verifyCode.biz_type, bizType),
        eq(verifyCode.receiver, receiver),
        eq(verifyCode.code, code),
        eq(verifyCode.channel, channel),
        isNull(verifyCode.used_at),
      ),
      orderBy: (data, { desc }) => [desc(data.created_at)],
    });

    if (!verifyRecord) {
      return false;
    }

    // 检查是否过期
    if (dayjs().isAfter(dayjs(verifyRecord.expired_at))) {
      return false;
    }

    // 标记验证码为已使用
    await db
      .update(verifyCode)
      .set({
        used_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(verifyCode.id, verifyRecord.id));

    return true;
  },

  // 生成并发送验证码
  async add(addDto: VerifyCodeAdd) {
    if (addDto.channel === VerifyCodeChannel.邮箱) {
      if (!z.email().safeParse(addDto.receiver).success) {
        throw new BusinessError("邮箱格式不正确");
      }
    }
    // 检查是否有未过期的验证码
    const existingCode = await db.query.verifyCode.findFirst({
      where: and(
        eq(verifyCode.receiver, addDto.receiver),
        eq(verifyCode.channel, addDto.channel),
        isNull(verifyCode.used_at),
      ),
      orderBy: (data, { desc }) => [desc(data.created_at)],
    });

    const now = dayjs();
    // 如果存在未过期的验证码，且距离上次发送不足1分钟，则拒绝重复发送
    if (existingCode && dayjs(existingCode.expired_at).isAfter(now)) {
      const timeDiff = now.diff(dayjs(existingCode.created_at), "minute");
      if (timeDiff < 1) {
        throw new BusinessError("验证码发送过于频繁，请稍后再试");
      }
    }

    let code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = now.add(10, "minute").toDate();

    try {
      await db.transaction(async (tx) => {
        // 保存验证码到数据库
        await tx.insert(verifyCode).values({
          biz_type: addDto.bizType,
          channel: addDto.channel,
          receiver: addDto.receiver,
          code,
          expired_at: expiredAt,
        });

        if (addDto.channel === VerifyCodeChannel.邮箱) {
          // 发送邮件
          await emailService.send({
            to: addDto.receiver,
            subject: "【FlowSite】注册验证码",
            html: generateHTML(code, 10),
          });
        }
      });
    } catch (error) {
      throw new BusinessError("验证码发送失败，请稍后重试");
    }
  },
};

// 生成验证码邮件HTML模板
function generateHTML(code: string, expiredMinutes: number = 10): string {
  return `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="utf-8">
        <title>邮箱验证码</title>
        <style>
            .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
            .code { font-size: 24px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>邮箱验证码</h1>
            </div>
            <div class="content">
                <p>您好！</p>
                <p>您正在进行注册操作，验证码如下：</p>
                <div class="code">${code}</div>
                <p>验证码将在 <strong>${expiredMinutes} 分钟</strong> 后失效，请尽快使用。</p>
                <p>如果这不是您的操作，请忽略此邮件。</p>
            </div>
            <div class="footer">
                <p>此邮件由系统自动发送，请勿回复。</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
