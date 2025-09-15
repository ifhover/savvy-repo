import { PageData, PageRequest } from "@repo/type";
import { useContext, useEffect, useMemo, useState } from "react";
import { FlowQueryOptions } from "./query";
import { useDependiceState } from "./utils";
import { PaginationProps } from "antd";

type PageQueryOptions<T> = FlowQueryOptions<T> & {
  page?: {
    page_size?: number;
    page_index?: number;
  };
};

type PageQueryReturn<T extends PageData<unknown>> = {
  list: T["data"];
  pagination: PaginationProps;
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
  search: () => void;
};

export function usePageQuery<
  T extends PageData<unknown>,
  Options extends PageQueryOptions<T>,
>(fn: (p: PageRequest) => Promise<T>, _options?: Options): PageQueryReturn<T> {
  const options: Options = Object.assign(
    {
      immediate: true,
      page: {
        page_size: 15,
        page_index: 1,
        total: 0,
      },
    },
    _options,
  );

  const [data, setData, enableData] = useDependiceState<T | undefined>(
    options?.initialData,
  );
  const [loading, setLoading, enableLoading] = useDependiceState(
    options?.immediate || false,
  );
  const [error, setError, enableError] = useDependiceState<Error | undefined>(
    undefined,
  );
  const list = useMemo<T["data"]>(() => data?.data ?? [], [data]);
  const [page, setPage] = useState(
    Object.assign(
      {
        page_size: 15,
        page_index: 1,
        total: 0,
      },
      options?.page,
    ),
  );

  async function fetchData(): Promise<T> {
    setLoading(true);
    return await fn({
      page_index: page.page_index,
      page_size: page.page_size,
    }).finally(() => setLoading(false));
  }

  const refetch = async () => {
    try {
      let data = await fetchData();
      setData(data);
      setPage({
        page_index: data.page_index,
        page_size: data.page_size,
        total: data.total,
      });
      setError(undefined);
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      setError(error as Error);
      if (options?.onError) {
        options.onError(error as Error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    setPage({
      page_index: 1,
      page_size: page.page_size,
      total: 0,
    });
    refetch();
  };

  useEffect(() => {
    if (options?.immediate) {
      refetch();
    }
  }, []);

  const pagination = useMemo(
    () => ({
      current: page.page_index,
      pageSize: page.page_size,
      total: page.total,
      onChange: (current: number, pageSize: number) => {
        setPage({
          page_index: current,
          page_size: pageSize,
          total: page.total,
        });
        refetch();
      },
    }),
    [page],
  );

  return {
    refetch,
    list,
    search,
    pagination,
    get data() {
      enableData();
      return data;
    },
    get loading() {
      enableLoading();
      return loading;
    },
    get error() {
      enableError();
      return error;
    },
  };
}
