import { useEffect } from "react";
import { InferReturnType, useDependiceState } from "./utils";

export type FlowQueryOptions<T> = {
  initialData?: T;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

type FlowQueryReturn<T, Options> = {
  data: Options extends { initialData: T } ? T : T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
};

export function useQuery<F extends () => Promise<any>>(
  fn: F,
  options?: FlowQueryOptions<InferReturnType<F>>,
): FlowQueryReturn<InferReturnType<F>, typeof options>;

export function useQuery<
  F extends () => Promise<any>,
  T extends InferReturnType<F>,
  Options extends FlowQueryOptions<T>,
>(fn: F, _options?: Options): FlowQueryReturn<T, Options> {
  const options: Options = Object.assign(
    {
      immediate: true,
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

  const refetch = async () => {
    setLoading(true);
    await fn()
      .then((data) => {
        setData(data);
        setError(undefined);
        options?.onSuccess?.(data);
      })
      .catch((error) => {
        setError(error);
        if (options?.onError) {
          options.onError(error);
        }
        throw error;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (options?.immediate) {
      refetch();
    }
  }, []);

  return {
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
    refetch,
  } as FlowQueryReturn<T, Options>;
}
