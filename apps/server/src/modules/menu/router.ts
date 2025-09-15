import { Hono } from "hono";
import { menuService } from "./service";
import { MenuAddRequest, MenuUpdateRequest } from "@repo/type";
import { validate } from "@/utils/validator";
import { z } from "zod";
import { success } from "@/utils/apiResponse";

const menuRouter = new Hono();

menuRouter.get("/list", async (c) => {
  const menus = await menuService.list();
  return success(menus);
});

menuRouter.get("/self", async (c) => {
  const menus = await menuService.self();
  return success(menus);
});

menuRouter.post("/add", async (c) => {
  const data = validate<MenuAddRequest>(
    await c.req.json(),
    z.object({
      name: z.string().trim().nonempty(),
      path: z.string().trim().nonempty(),
      pid: z.string().trim().nullable(),
    })
  );
  return success(await menuService.add(data));
});

menuRouter.post("/update", async (c) => {
  const data = validate<MenuUpdateRequest>(
    await c.req.json(),
    z.object({
      id: z.string().trim().nonempty(),
      name: z.string().trim().nonempty(),
      path: z.string().trim().nonempty(),
      pid: z.string().trim().nullable(),
    })
  );
  return success(await menuService.update(data));
});

menuRouter.post("/delete/:id", async (c) => {
  await menuService.delete(c.req.param("id"));
  return success();
});

menuRouter.get("/:id", async (c) => {
  const menu = await menuService.get(c.req.param("id"));
  return success(menu);
});

export default menuRouter;
