import { Hono } from "hono";
import { UserDetail } from "@repo/type";

declare module "hono" {
  interface ContextVariableMap {
    user: UserDetail;
  }
}
