import { useDependiceState } from "./utils";
import { useContext } from "react";

type FlowMutateOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

type FlowMutateReturn<T, P extends unknown[]> = {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  trigger: (...p: P) => Promise<void>;
};

export function useMutate<T, P extends any[]>(
  fn: (...p: P) => Promise<T>,
  options?: FlowMutateOptions<T>
): FlowMutateReturn<T, P> {
  const [data, setData, enableData] = useDependiceState<T | undefined>(
    undefined
  );
  const [loading, setLoading, enableLoading] = useDependiceState(false);
  const [error, setError, enableError] = useDependiceState<Error | undefined>(
    undefined
  );

  const trigger = async (...p: P) => {
    setLoading(true);
    await fn(...p)
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
    trigger,
  };
}
