import { useEffect, useState } from "react";

type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useFetch<T>(cb: () => Promise<T>) {
  const [reqState, setReqState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    isError: false,
    error: null,
  });

  let dataPromise!: Promise<T>;
  try {
    dataPromise = cb();
  } catch (err) {
    setReqState({
      data: null,
      isLoading: false,
      isError: true,
      error: err as Error,
    });
  }

  useEffect(() => {
    if (reqState.isError) return;

    const handleResponse = async () => {
      try {
        const data = await dataPromise;
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
      }
    };

    handleResponse();
  }, []);

  return reqState;
}
