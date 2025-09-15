export type Menu = {
  id: string;
  name: string;
  path: string;
  pid: string | null;
  created_at: Date;
  updated_at: Date;
};

export type MenuTree = Menu & {
  children: MenuTree[] | undefined;
};

export type MenuAddRequest = Omit<Menu, "id" | "created_at" | "updated_at">;

export type MenuUpdateRequest = Omit<Menu, "created_at" | "updated_at">;
