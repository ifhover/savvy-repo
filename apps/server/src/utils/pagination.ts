import { db } from "@/db/db";
import { PageRequest } from "@repo/type";
import { PgSelect } from "drizzle-orm/pg-core";

export async function withPagination<T extends PgSelect>(
  query: T,
  page: PageRequest<any>,
) {
  let baseQuery = query
    .limit(page.page_size)
    .offset((page.page_index - 1) * page.page_size);

  const total = await db.$count(baseQuery);
  const data = await baseQuery;

  return {
    page_size: page.page_size,
    page_index: page.page_index,
    total,
    data,
  };
}
