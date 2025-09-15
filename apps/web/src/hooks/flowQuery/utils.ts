import { Dispatch, SetStateAction, useRef, useState } from "react";

export function useDependiceState<T = undefined>(): [
  T | undefined,
  Dispatch<SetStateAction<T | undefined>>,
  () => void,
];

export function useDependiceState<T>(
  init: T
): [T, Dispatch<SetStateAction<T>>, () => void];

export function useDependiceState<T>(init?: T) {
  const [, setData] = useState<T | undefined>(init);
  const refData = useRef<T | undefined>(init);
  const isEnable = useRef(false);

  return [
    refData.current,
    (value: T | undefined) => {
      refData.current = value;
      if (isEnable.current) {
        setData(refData.current);
      }
    },
    () => (isEnable.current = true),
  ];
}

export type InferReturnType<F extends (...args: any[]) => any> = Awaited<
  ReturnType<F>
>;

export type InferParams<F extends (p: any) => any> = F extends (
  p: infer P
) => any
  ? P
  : never;
