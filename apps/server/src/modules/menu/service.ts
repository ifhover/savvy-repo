import { db } from "@/db/db";
import { menu } from "@/db/schema";
import { Menu, MenuAddRequest, MenuUpdateRequest, MenuTree } from "@repo/type";
import { eq } from "drizzle-orm";

export const menuService = {
  async list(): Promise<MenuTree[]> {
    const list = await db.query.menu.findMany();

    const map = new Map<string, Menu[]>();
    list.forEach((item) => {
      let pid = item.pid || "";
      map.set(pid, [...(map.get(pid) || []), item]);
    });

    function recurse(list: Menu[]): MenuTree[] {
      return list.map((item) => {
        let children = recurse(map.get(item.id) || []);
        if (children.length > 0 && children[0].pid === item.pid) {
          return { ...item, children: undefined };
        }
        return {
          ...item,
          children: children.length > 0 ? children : undefined,
        };
      });
    }

    return recurse(map.get("") || []);
  },
  async add(dto: MenuAddRequest): Promise<Menu> {
    return (await db.insert(menu).values(dto).returning())[0];
  },
  async delete(id: string): Promise<void> {
    await db.delete(menu).where(eq(menu.id, id));
  },
  async update(dto: MenuUpdateRequest): Promise<Menu> {
    return (
      await db.update(menu).set(dto).where(eq(menu.id, dto.id)).returning()
    )[0];
  },
  async get(id: string): Promise<Menu | undefined> {
    return await db.query.menu.findFirst({
      where: eq(menu.id, id),
    });
  },
  async self(): Promise<MenuTree[]> {
    return this.list();
  },
};
