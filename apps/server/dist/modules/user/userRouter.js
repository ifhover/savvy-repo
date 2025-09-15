import { Hono } from "hono";
import { success } from "../../utils/apiResponse";
import { getConnInfo } from "@hono/node-server/conninfo";

const userRouter = new Hono();

userRouter.get("/", (c) => {
  const info = getConnInfo(c);
  return success(info.remote.address, "Hello World");
});

export default userRouter;
