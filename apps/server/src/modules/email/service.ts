import nodemailer from "nodemailer";
import { EmailSendDto } from "@/modules/email/type";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // 发送方邮箱
    pass: process.env.SMTP_PASS, // 邮箱授权码
  },
});

export const emailService = {
  async send(dto: EmailSendDto) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
      });
    } catch (error) {
      throw new Error("邮件发送失败");
    }
  },
};
