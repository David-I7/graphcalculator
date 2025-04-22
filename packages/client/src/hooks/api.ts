import { useEffect, useState } from "react";

type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
};

type Trigger = () => void;

export function useLazyFetch<Data>(
  cb: () => Promise<Data>
): [Trigger, FetchState<Data>] {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [reqState, setReqState] = useState<FetchState<Data>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    reset,
  });

  function reset() {
    if (isActivated) return;
    setReqState({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      reset,
    });
  }

  const trigger: Trigger = () => {
    setIsActivated(true);
    setReqState({
      data: reqState.data,
      isLoading: true,
      isError: false,
      error: null,
      reset,
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
          reset,
        });
      } catch (err) {
        if (err instanceof Error) {
          setReqState({
            data: null,
            isLoading: false,
            isError: true,
            error: err,
            reset,
          });
        } else {
          setReqState({
            data: null,
            isLoading: false,
            isError: true,
            error: new Error(JSON.stringify(err)),
            reset,
          });
        }
      } finally {
        setIsActivated(false);
      }
    })();
  }, [isActivated]);

  return [trigger, reqState];
}
