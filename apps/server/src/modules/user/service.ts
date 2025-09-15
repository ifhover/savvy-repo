import NodeCache from "node-cache";
import { type LoginCheckDto, type LoginDto, type RegisterDto } from "./type";
import { BusinessError } from "@/utils/exception";
import bcrypt from "bcrypt";
import { v7 } from "uuid";
import dayjs from "dayjs";
import { db } from "@/db/db";
import { token, user } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { Status, type UserDetail } from "@repo/type";
import { verifyCodeService } from "@/modules/verifyCode/service";
import { VerifyCodeBizType, VerifyCodeChannel } from "@repo/type";
import { captchaService } from "@/modules/captcha/service";

const userCache = new NodeCache();
const saltRounds = 10;

export const userService = {
  loginCheck(dto: LoginCheckDto): boolean {
    return userService.checkDevice(dto.ip, dto.account);
  },
  checkDevice(ip: string, account: string): boolean {
    if ((userCache.get<number>(`ip:${ip}`) ?? 0) >= 5) {
      return false;
    }
    if ((userCache.get<number>(`account:${account}`) ?? 0) >= 5) {
      return false;
    }
    return true;
  },
  increaseDevice(ip: string, account: string) {
    userCache.set(
      `ip:${ip}`,
      (userCache.get<number>(`ip:${ip}`) ?? 0) + 1,
      60 * 5,
    );
    userCache.set(
      `account:${account}`,
      (userCache.get<number>(`account:${account}`) ?? 0) + 1,
      60 * 5,
    );
  },
  async login(dto: LoginDto): Promise<string> {
    if (!dto.ip) {
      throw new BusinessError("获取客户端IP失败");
    }
    if (!this.checkDevice(dto.ip, dto.account)) {
      if (
        !(
          dto.captcha_id &&
          dto.captcha_value &&
          captchaService.verify(dto.captcha_id, dto.captcha_value)
        )
      ) {
        throw new BusinessError("验证码错误", Status.Captcha);
      }
    }

    this.increaseDevice(dto.ip, dto.account);

    const userResult = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, dto.account),
    });

    if (!userResult) {
      throw new BusinessError("用户名或密码错误");
    }

    if (!(await bcrypt.compare(dto.password, userResult.password))) {
      throw new BusinessError("用户名或密码错误");
    }

    // 使旧token失效
    await db
      .update(token)
      .set({
        expired_at: dayjs().toDate(),
      })
      .where(eq(token.user_id, userResult.id));

    // 创建新token，并正确关联用户ID
    const tokenData = await db
      .insert(token)
      .values({
        user_id: userResult.id,
        token: v7(),
        expired_at: dayjs().add(1, "day").toDate(),
      })
      .returning();

    return tokenData[0].token;
  },
  async registerCheckEmail(email: string) {
    return (await db.$count(user, eq(user.email, email))) !== undefined;
  },
  async register(dto: RegisterDto) {
    if (
      !(await verifyCodeService.verify({
        bizType: VerifyCodeBizType.注册,
        channel: VerifyCodeChannel.邮箱,
        receiver: dto.email,
        code: dto.email_verify_code,
      }))
    ) {
      throw new BusinessError("邮箱验证码错误", Status.Captcha);
    }
    if (!(await this.registerCheckEmail(dto.email))) {
      throw new BusinessError("该邮箱已注册");
    }
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
    await db.insert(user).values({
      email: dto.email,
      password: hashedPassword,
    });
  },
  async getByToken(tokenStr: string): Promise<UserDetail | undefined> {
    const tokenData = await db.query.token.findFirst({
      where: and(eq(token.token, tokenStr), gt(token.expired_at, new Date())),
      with: {
        user: true,
      },
    });

    if (!tokenData || !tokenData.user) {
      return undefined;
    }

    return {
      id: tokenData.user.id,
      email: tokenData.user.email,
      created_at: tokenData.user.created_at,
      updated_at: tokenData.user.created_at,
    };
  },
};
