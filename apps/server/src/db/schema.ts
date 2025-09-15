import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { v7 } from "uuid";
import { VerifyCodeBizType, VerifyCodeChannel } from "@repo/type";

export const user = pgTable("user", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  email: text("email").notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const token = pgTable("token", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  user_id: uuid("user_id").references(() => user.id),
  token: text("token").notNull(),
  expired_at: timestamp("expired_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tokenRelations = relations(token, ({ one }) => ({
  user: one(user, {
    fields: [token.user_id],
    references: [user.id],
  }),
}));

export const verifyCode = pgTable("verify_code", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  channel: text().notNull().$type<VerifyCodeChannel>(),
  receiver: text().notNull(),
  biz_type: text().notNull().$type<VerifyCodeBizType>(),
  code: text().notNull(),
  expired_at: timestamp({ withTimezone: true }).notNull(),
  used_at: timestamp({ withTimezone: true }),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const menu = pgTable("menu", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  pid: uuid("pid"),
  name: text("name").notNull(),
  path: text("path").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
