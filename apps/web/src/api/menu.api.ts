import { request } from "@/utils/request";
import { Menu, MenuAddRequest, MenuTree, MenuUpdateRequest } from "@repo/type";

export const menuApi = {
  list: () => request<MenuTree[]>("/menu/list"),

  add: (data: MenuAddRequest) =>
    request<Menu>("/menu/add", { method: "POST", data }),

  update: (data: MenuUpdateRequest) =>
    request<Menu>("/menu/update", { method: "POST", data }),

  delete: (id: string) =>
    request<void>(`/menu/delete/${id}`, { method: "POST" }),

  get: (id: string) => request<Menu>(`/menu/${id}`, { method: "GET" }),

  self: () => request<MenuTree[]>("/menu/self", { method: "GET" }),
};
