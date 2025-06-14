import { useEffect, useState } from "react";

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export type Trigger = () => void;

export function useLazyFetch<Data>(
  cb: () => Promise<Data>
): [Trigger, FetchState<Data> & { reset: () => void }] {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [reqState, setReqState] = useState<FetchState<Data>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  });

  const reset = () => {
    if (isActivated) return;
    setReqState({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  };

  const trigger: Trigger = () => {
    setIsActivated(true);
    setReqState({
      data: reqState.data,
      isLoading: true,
      isError: false,
      error: null,
    });
  };

  useEffect(() => {
    if (!isActivated) return;

    (async () => {
      try {
        const data = await cb();
        setReqState({
          data,
          isLoading: false,
          isError: false,
          error: null,
        });
      } catch (err) {
        if (err instanceof Error) {
          setReqState({
            data: null,
            isLoading: false,
            isError: true,
            error: err,
          });
        } else {
          setReqState({
            data: null,
            isLoading: false,
            isError: true,
            error: new Error(JSON.stringify(err)),
          });
        }
      } finally {
        setIsActivated(false);
      }
    })();
  }, [isActivated]);

  return [trigger, { ...reqState, reset }];
}
